<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

/** Validacao online: nunca confia no conteudo de JWT decodificado localmente. */
class AuthenticateSupabase
{
    public function handle(Request $request, Closure $next): Response
    {
        $url = rtrim((string) config('services.supabase.url'), '/');
        $key = (string) config('services.supabase.publishable_key');
        if (!$url || !$key) return response()->json(['message' => 'Autenticacao nao configurada.'], 503);
        $token = $request->session()->get('supa_access');
        $refresh = $request->session()->get('supa_refresh');
        if (!$token) return response()->json(['message' => 'Faça login para continuar.'], 401);

        try {
            $client = Http::timeout(10)->withHeaders(['apikey' => $key])->acceptJson();
            if (time() >= (int) $request->session()->get('supa_expiry', 0) - 45) {
                if (!$refresh) return $this->expired($request);
                $renew = $client->post($url.'/auth/v1/token?grant_type=refresh_token', ['refresh_token' => $refresh]);
                $credentials = $renew->json() ?: [];
                if (!$renew->successful() || empty($credentials['access_token']) || empty($credentials['refresh_token'])) {
                    return $this->expired($request);
                }
                $token = $credentials['access_token'];
                $request->session()->put('supa_access', $token);
                $request->session()->put('supa_refresh', $credentials['refresh_token']);
                $request->session()->put('supa_expiry', time() + (int) ($credentials['expires_in'] ?? 3600));
            }
            $result = $client->withToken($token)->get($url.'/auth/v1/user');
            if (!$result->ok() || !is_string($result->json('id'))) return $this->expired($request);
            $userId = $result->json('id');
            $cliente = DB::table('clientes')->where('auth_user_id', $userId)->first();
            $staff = DB::table('bibliotecarios')->where('auth_user_id', $userId)->first();
            if (!$cliente && !$staff) return response()->json(['message' => 'Perfil inexistente. Execute o SQL inicial e o trigger de cadastro.'], 403);

            $request->attributes->set('auth_user_id', $userId);
            $request->attributes->set('auth_user_public', ['id' => $userId, 'email' => $result->json('email')]);
            $request->attributes->set('cliente', $cliente);
            $request->attributes->set('bibliotecario', $staff);
            return $next($request);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            return response()->json(['message' => 'Supabase Auth indisponivel.'], 503);
        }
    }

    private function expired(Request $request): Response
    {
        $request->session()->forget(['supa_access', 'supa_refresh', 'supa_expiry']);
        return response()->json(['message' => 'Sessao expirada; entre novamente.'], 401);
    }
}
