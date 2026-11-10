<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\ConnectionException;

/**
 * BFF: navegador so recebe um ID de sessao HttpOnly.
 * Senhas seguem apenas em transito HTTPS ate Supabase Auth e nunca sao armazenadas.
 * JWT + refresh_token ficam exclusivamente em sessoes Laravel criptografadas no servidor.
 */
class SessionController
{
    private function endpoint(): string
    {
        return rtrim((string) config('services.supabase.url'), '/');
    }
    private function key(): string
    {
        return (string) config('services.supabase.publishable_key');
    }
    private function ready(): bool
    {
        return filter_var($this->endpoint(), FILTER_VALIDATE_URL)
            && !str_contains($this->endpoint(), 'SEU_PROJECT_REF')
            && $this->key() !== '' && !str_contains($this->key(), 'SUBSTITUA');
    }
    private function authClient()
    {
        return Http::timeout(12)->withHeaders(['apikey' => $this->key()])->acceptJson();
    }
    private function persist(Request $request, array $data): void
    {
        $request->session()->regenerate(); // defesa contra session fixation
        $request->session()->put('supa_access', $data['access_token']);
        $request->session()->put('supa_refresh', $data['refresh_token']);
        $request->session()->put('supa_expiry', time() + (int) ($data['expires_in'] ?? 3600));
    }

    public function csrf(Request $request)
    {
        return response()->json(['csrf_token' => $request->session()->token()]);
    }

    public function login(Request $request)
    {
        $values = $request->validate([
            'email' => 'required|email|max:255',
            'password' => 'required|string|max:1024',
        ]);
        if (!$this->ready()) return response()->json(['message' => 'Configure SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no backend/.env'], 503);
        try {
            $result = $this->authClient()->post($this->endpoint().'/auth/v1/token?grant_type=password', $values);
            $body = $result->json() ?: [];
            if (!$result->successful() || empty($body['access_token']) || empty($body['refresh_token'])) {
                return response()->json(['message' => 'E-mail ou senha incorretos, ou e-mail ainda nao confirmado.'], 401);
            }
            $this->persist($request, $body);
            return response()->json(['message' => 'Login realizado.']);
        } catch (ConnectionException $e) {
            return response()->json(['message' => 'Supabase Auth indisponivel.'], 503);
        }
    }

    public function register(Request $request)
    {
        $values = $request->validate([
            'nome' => 'required|string|min:2|max:100',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8|max:1024',
        ]);
        if (!$this->ready()) return response()->json(['message' => 'Configure o Supabase antes de cadastrar contas.'], 503);
        $front = rtrim((string) config('services.frontend_url'), '/');
        try {
            $result = $this->authClient()
                ->post($this->endpoint().'/auth/v1/signup?'.http_build_query(['redirect_to' => $front.'/login']), [
                    'email' => $values['email'],
                    'password' => $values['password'],
                    'data' => ['nome' => $values['nome']],
                ]);
            $body = $result->json() ?: [];
            if (!$result->successful()) {
                return response()->json(['message' => 'Nao foi possivel criar a conta. Confira o e-mail e os requisitos da senha.'], 422);
            }
            // Se Supabase nao exigir confirmacao, ha sessao retornada.
            if (!empty($body['access_token']) && !empty($body['refresh_token'])) {
                $this->persist($request, $body);
                return response()->json(['logged_in' => true, 'message' => 'Conta criada.'], 201);
            }
            return response()->json(['logged_in' => false, 'message' => 'Se o e-mail for valido, voce recebera uma mensagem de confirmacao.'], 201);
        } catch (ConnectionException $e) {
            return response()->json(['message' => 'Supabase Auth indisponivel.'], 503);
        }
    }

    public function me(Request $request)
    {
        // Middleware ja validou a sessao, JWT, papel e banco na requisicao.
        $client = $request->attributes->get('cliente');
        $staff = $request->attributes->get('bibliotecario');
        return response()->json([
            'user' => $request->attributes->get('auth_user_public'),
            'profile' => [
                'role' => $staff ? 'bibliotecario' : 'cliente',
                'cliente' => $client,
                'bibliotecario' => $staff,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $access = $request->session()->get('supa_access');
        if ($access && $this->ready()) {
            try {
                // Revoga sessao do Supabase, quando acessivel; o logout local e imediato.
                $this->authClient()->withToken($access)
                    ->post($this->endpoint().'/auth/v1/logout');
            } catch (\Throwable $e) { /* falha remota nao impede revogacao local */ }
        }
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['message' => 'Sessao encerrada.']);
    }

    public function google(Request $request)
    {
        if (!$this->ready()) return redirect(rtrim((string) config('services.frontend_url'), '/').'/login?erro=configuracao');
        $verifier = rtrim(strtr(base64_encode(random_bytes(48)), '+/', '-_'), '=');
        $challenge = rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '=');
        // O verificador fica na sessao criptografada DO SERVIDOR, nao no localStorage.
        $request->session()->put('google_pkce_verifier', $verifier);
        $request->session()->put('google_pkce_started', time());
        $callback = rtrim((string) config('services.frontend_url'), '/').'/api/auth/google/callback';
        $url = $this->endpoint().'/auth/v1/authorize?'.http_build_query([
            'provider' => 'google',
            'redirect_to' => $callback,
            'code_challenge' => $challenge,
            'code_challenge_method' => 's256',
        ], '', '&', PHP_QUERY_RFC3986);
        return redirect()->away($url);
    }

    public function googleCallback(Request $request)
    {
        $front = rtrim((string) config('services.frontend_url'), '/');
        $verifier = $request->session()->pull('google_pkce_verifier');
        $started = (int) $request->session()->pull('google_pkce_started', 0);
        $code = $request->query('code');
        if (!$verifier || !$started || time() - $started > 600 || !is_string($code) || !preg_match('/^[\w-]{6,1024}$/', $code)) {
            return redirect()->away($front.'/login?erro=oauth');
        }
        try {
            $result = $this->authClient()->post($this->endpoint().'/auth/v1/token?grant_type=pkce', [
                'auth_code' => $code,
                'code_verifier' => $verifier,
            ]);
            $body = $result->json() ?: [];
            if (!$result->successful() || empty($body['access_token']) || empty($body['refresh_token'])) {
                return redirect()->away($front.'/login?erro=oauth');
            }
            $this->persist($request, $body);
            return redirect()->away($front.'/minha-conta');
        } catch (ConnectionException $e) {
            return redirect()->away($front.'/login?erro=rede');
        }
    }
}
