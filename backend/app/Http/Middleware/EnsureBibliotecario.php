<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureBibliotecario
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->attributes->get('bibliotecario')) {
            Log::warning('Tentativa de acesso a area administrativa sem permissao', [
                'path' => $request->path(),
                'method' => $request->method(),
                'ip' => $request->ip(),
                'cliente_id' => $request->attributes->get('cliente')?->id_cliente,
            ]);
            return response()->json(['message' => 'Acesso restrito à equipe da biblioteca.'], 403);
        }
        return $next($request);
    }
}
