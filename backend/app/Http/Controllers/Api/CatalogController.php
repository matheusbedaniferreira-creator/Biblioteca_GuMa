<?php
namespace App\Http\Controllers\Api;

use App\Support\Catalog;
use Illuminate\Http\Request;

class CatalogController
{
    public function index(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:120',
            'tema' => 'nullable|string|max:80',
            'disponivel' => 'nullable|in:0,1',
            'page' => 'nullable|integer|min:1',
        ]);
        $query = Catalog::query();
        if ($term = trim((string) $request->query('q', ''))) {
            // Escape de metacaracteres LIKE para buscas literais.
            $safe = addcslashes($term, '\\%_');
            $query->where(function ($q) use ($safe) {
                $q->where('l.titulo', 'ilike', '%'.$safe.'%')
                  ->orWhere('a.nome', 'ilike', '%'.$safe.'%')
                  ->orWhere('l.tema', 'ilike', '%'.$safe.'%');
            });
        }
        if ($request->filled('tema')) $query->where('l.tema', $request->query('tema'));
        if ($request->query('disponivel') === '1') $query->where('l.quantidade_disponivel', '>', 0);
        return response()->json($query->orderBy('l.titulo')->paginate(12));
    }

    public function show(int $id)
    {
        $book = Catalog::query()->where('l.id_livro', $id)->first();
        if (!$book) return response()->json(['message' => 'Livro não encontrado.'], 404);
        return response()->json($book);
    }

    public function highlights()
    {
        return response()->json([
            'destaques' => Catalog::query()->where('l.destaque', true)
                ->orderByDesc('popularidade')->orderBy('l.titulo')->limit(8)->get(),
            'mais_procurados' => Catalog::query()->whereRaw('COALESCE(pop.total_solicitacoes, 0) > 0')->orderByDesc('popularidade')
                ->orderBy('l.titulo')->limit(8)->get(),
        ]);
    }
}
