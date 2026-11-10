<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBibliotecario
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->attributes->get('bibliotecario')) {
            return response()->json(['message' => 'Acesso restrito à equipe da biblioteca.'], 403);
        }
        return $next($request);
    }
}
