<?php
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\GoogleBooksController;
use App\Http\Controllers\Api\SessionController;
use Illuminate\Support\Facades\Route;

// Apesar do prefixo /api, as rotas usam 'web' para cookies de sessao + CSRF.
// O Vite encaminha /api no MESMO dominio do navegador.
Route::middleware(['web', 'no.cache'])->group(function () {
    Route::get('/health', fn () => response()->json(['ok' => true, 'service' => 'biblioteca-api', 'auth' => 'server-session']));
    Route::get('/auth/csrf', [SessionController::class, 'csrf']);
    Route::post('/auth/login', [SessionController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/auth/register', [SessionController::class, 'register'])->middleware('throttle:4,1');
    Route::post('/auth/logout', [SessionController::class, 'logout']);
    Route::get('/auth/google', [SessionController::class, 'google'])->middleware('throttle:10,1');
    Route::get('/auth/google/callback', [SessionController::class, 'googleCallback'])->middleware('throttle:10,1');
    Route::get('/google-books', [GoogleBooksController::class, 'search'])->middleware('throttle:30,1');
    Route::get('/livros', [CatalogController::class, 'index']);
    Route::get('/livros/destaques', [CatalogController::class, 'highlights']);
    Route::get('/livros/{id}', [CatalogController::class, 'show'])->whereNumber('id');

    Route::middleware(['supabase.auth', 'throttle:60,1'])->group(function () {
        Route::get('/auth/me', [SessionController::class, 'me']);
        Route::get('/me', [MeController::class, 'show']);
        Route::patch('/me', [MeController::class, 'update']);
        Route::get('/me/emprestimos', [MeController::class, 'loans']);
        Route::get('/me/solicitacoes', [MeController::class, 'requests']);
        Route::post('/me/solicitacoes', [MeController::class, 'requestBook']);
        Route::patch('/me/solicitacoes/{id}/cancelar', [MeController::class, 'cancelRequest'])->whereNumber('id');

        Route::prefix('admin')->middleware('bibliotecario')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'dashboard']);
            Route::get('/autores', [AdminController::class, 'authors']);
            Route::post('/autores', [AdminController::class, 'createAuthor']);
            Route::get('/bibliotecas', [AdminController::class, 'libraries']);
            Route::post('/bibliotecas', [AdminController::class, 'createLibrary']);
            Route::get('/livros', [AdminController::class, 'books']);
            Route::post('/livros', [AdminController::class, 'createBook']);
            Route::patch('/livros/{id}', [AdminController::class, 'updateBook'])->whereNumber('id');
            Route::get('/clientes', [AdminController::class, 'customers']);
            Route::get('/solicitacoes', [AdminController::class, 'requests']);
            Route::post('/solicitacoes/{id}/emprestar', [AdminController::class, 'approveRequest'])->whereNumber('id');
            Route::post('/solicitacoes/{id}/recusar', [AdminController::class, 'rejectRequest'])->whereNumber('id');
            Route::get('/emprestimos', [AdminController::class, 'loans']);
            Route::post('/emprestimos', [AdminController::class, 'createLoan']);
            Route::post('/emprestimos/{id}/devolver', [AdminController::class, 'returnLoan'])->whereNumber('id');
        });
    });
});
