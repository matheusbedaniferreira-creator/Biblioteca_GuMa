<?php
namespace App\Http\Controllers\Api;

use App\Support\Catalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
        $params = [
            'q' => trim((string) $request->query('q', '')),
            'tema' => (string) $request->query('tema', ''),
            'disponivel' => (string) $request->query('disponivel', ''),
            'page' => (int) $request->query('page', 1),
        ];
        $key = 'catalog:index:v'.Catalog::version().':'.md5(json_encode($params));
        $result = Cache::remember($key, 60, function () use ($params) {
            $query = Catalog::query();
            if ($params['q'] !== '') {
                $safe = addcslashes($params['q'], '\\%_');
                $query->where(function ($q) use ($safe) {
                    $q->where('l.titulo', 'ilike', '%'.$safe.'%')
                      ->orWhere('a.nome', 'ilike', '%'.$safe.'%')
                      ->orWhere('l.tema', 'ilike', '%'.$safe.'%');
                });
            }
            if ($params['tema'] !== '') $query->where('l.tema', $params['tema']);
            if ($params['disponivel'] === '1') $query->where('l.quantidade_disponivel', '>', 0);
            return $query->orderBy('l.titulo')->paginate(12);
        });
        return response()->json($result);
    }

    public function show(int $id)
    {
        $key = 'catalog:show:v'.Catalog::version().':'.$id;
        $book = Cache::remember($key, 60, fn () => Catalog::query()->where('l.id_livro', $id)->first());
        if (!$book) return response()->json(['message' => 'Livro não encontrado.'], 404);
        return response()->json($book);
    }

    public function highlights()
    {
        $key = 'catalog:highlights:v'.Catalog::version();
        $data = Cache::remember($key, 60, fn () => [
            'destaques' => Catalog::query()->where('l.destaque', true)
                ->orderByDesc('popularidade')->orderBy('l.titulo')->limit(8)->get(),
            'mais_procurados' => Catalog::query()->whereRaw('COALESCE(pop.total_solicitacoes, 0) > 0')->orderByDesc('popularidade')
                ->orderBy('l.titulo')->limit(8)->get(),
        ]);
        return response()->json($data);
    }
}
