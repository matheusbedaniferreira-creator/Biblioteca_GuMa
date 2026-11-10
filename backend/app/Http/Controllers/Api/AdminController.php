<?php
namespace App\Http\Controllers\Api;

use App\Support\Catalog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminController
{
    public function dashboard()
    {
        return response()->json([
            'livros' => DB::table('livros')->count(),
            'exemplares_disponiveis' => (int) DB::table('livros')->sum('quantidade_disponivel'),
            'clientes' => DB::table('clientes')->count(),
            'emprestimos_ativos' => DB::table('emprestimos')->where('status', 'EMPRESTADO')->count(),
            'solicitacoes_pendentes' => DB::table('solicitacoes')->where('status', 'PENDENTE')->count(),
            'emprestimos_atrasados' => DB::table('emprestimos')
                ->where('status', 'EMPRESTADO')->whereDate('data_prevista_devolucao', '<', now('UTC')->toDateString())->count(),
        ]);
    }

    public function authors()
    {
        return response()->json(DB::table('autores')->orderBy('nome')->get());
    }

    public function createAuthor(Request $request)
    {
        $data = $request->validate(['nome' => 'required|string|max:100', 'nacionalidade' => 'nullable|string|max:50']);
        $id = DB::table('autores')->insertGetId($data, 'id_autor');
        return response()->json(DB::table('autores')->where('id_autor', $id)->first(), 201);
    }

    public function libraries()
    {
        return response()->json(DB::table('bibliotecas')->orderBy('nome')->get());
    }

    public function createLibrary(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:100', 'endereco' => 'nullable|string|max:200',
            'data_fundacao' => 'nullable|date',
            'horario_abertura' => 'required|date_format:H:i',
            'horario_fechamento' => 'required|date_format:H:i',
        ]);
        $id = DB::table('bibliotecas')->insertGetId($data, 'id_biblioteca');
        return response()->json(DB::table('bibliotecas')->where('id_biblioteca', $id)->first(), 201);
    }

    private function bookData(Request $request, bool $update = false): array
    {
        $required = $update ? 'sometimes' : 'required';
        return $request->validate([
            'titulo' => "$required|string|max:150",
            'tema' => 'nullable|string|max:80',
            'secao' => 'nullable|string|max:50',
            'edicao' => 'nullable|string|max:20',
            'ano_publicacao' => 'nullable|integer|between:0,2100',
            'sinopse' => 'nullable|string|max:8000',
            'imagem_capa_url' => 'nullable|url|starts_with:https://|max:2000',
            'quantidade_total' => "$required|integer|min:0|max:1000000",
            'id_autor' => 'nullable|integer|exists:autores,id_autor',
            'id_biblioteca' => "$required|integer|exists:bibliotecas,id_biblioteca",
            'destaque' => 'sometimes|boolean',
        ]);
    }

    public function books(Request $request)
    {
        $data = $request->validate([
            'q' => 'nullable|string|max:120',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);
        $query = Catalog::query();
        if ($term = trim($data['q'] ?? '')) {
            $safe = addcslashes($term, '\\%_');
            $query->where(fn ($builder) => $builder
                ->where('l.titulo', 'ilike', '%'.$safe.'%')
                ->orWhere('a.nome', 'ilike', '%'.$safe.'%'));
        }
        return response()->json($query->orderBy('l.titulo')->paginate((int) ($data['per_page'] ?? 24)));
    }

    public function createBook(Request $request)
    {
        $data = $this->bookData($request);
        $data['destaque'] = $data['destaque'] ?? false;
        // O trigger SQL define quantidade_disponivel a partir de quantidade_total.
        $id = DB::table('livros')->insertGetId($data, 'id_livro');
        return response()->json(Catalog::query()->where('l.id_livro', $id)->first(), 201);
    }

    public function updateBook(Request $request, int $id)
    {
        $data = $this->bookData($request, true);
        return DB::transaction(function () use ($id, $data) {
            $book = DB::table('livros')->where('id_livro', $id)->lockForUpdate()->first();
            if (!$book) return response()->json(['message' => 'Livro não encontrado.'], 404);
            if (isset($data['quantidade_total'])) {
                $emprestados = $book->quantidade_total - $book->quantidade_disponivel;
                if ($data['quantidade_total'] < $emprestados) {
                    throw ValidationException::withMessages(['quantidade_total' =>
                        "Há $emprestados exemplares emprestados. O total não pode ser menor que isso."]);
                }
            }
            if ($data) DB::table('livros')->where('id_livro', $id)->update($data);
            return response()->json(Catalog::query()->where('l.id_livro', $id)->first());
        });
    }

    public function customers(Request $request)
    {
        $q = DB::table('clientes')->select('id_cliente', 'nome', 'email', 'data_cadastro')->orderBy('nome');
        if ($request->filled('q')) {
            $term = addcslashes(mb_substr($request->query('q'), 0, 100), '\\%_');
            $q->where(fn($query) => $query->where('nome', 'ilike', '%'.$term.'%')
                ->orWhere('email', 'ilike', '%'.$term.'%'));
        }
        return response()->json($q->limit(100)->get());
    }

    public function requests()
    {
        return response()->json(DB::table('solicitacoes as s')
            ->join('clientes as c', 'c.id_cliente', '=', 's.id_cliente')
            ->join('livros as l', 'l.id_livro', '=', 's.id_livro')
            ->select('s.*', 'c.nome as cliente', 'c.email as email_cliente',
                'l.titulo', 'l.quantidade_disponivel')
            ->orderByRaw("CASE WHEN s.status = 'PENDENTE' THEN 0 ELSE 1 END")
            ->orderByDesc('s.data_solicitacao')->limit(200)->get());
    }

    public function rejectRequest(int $id)
    {
        $updated = DB::table('solicitacoes')->where('id_solicitacao', $id)
            ->where('status', 'PENDENTE')->update(['status' => 'RECUSADA']);
        return $updated ? response()->json(['message' => 'Solicitação recusada.'])
            : response()->json(['message' => 'Solicitação já processada ou inexistente.'], 409);
    }

    /** Aprovacao significa retirada efetivada; cria emprestimo atomicamente. */
    public function approveRequest(Request $request, int $id)
    {
        $data = $request->validate(['data_prevista_devolucao' => 'required|date|after_or_equal:today']);
        return DB::transaction(function () use ($request, $id, $data) {
            $sol = DB::table('solicitacoes')->where('id_solicitacao', $id)->lockForUpdate()->first();
            if (!$sol || $sol->status !== 'PENDENTE') return response()->json([
                'message' => 'Solicitação já processada ou inexistente.'
            ], 409);
            $idEmprestimo = $this->insertLoan($request, (int) $sol->id_cliente,
                (int) $sol->id_livro, $data['data_prevista_devolucao']);
            DB::table('solicitacoes')->where('id_solicitacao', $id)->update(['status' => 'APROVADA']);
            return response()->json(['message' => 'Retirada confirmada e empréstimo registrado.',
                'id_emprestimo' => $idEmprestimo], 201);
        });
    }

    public function createLoan(Request $request)
    {
        $data = $request->validate([
            'id_cliente' => 'required|integer|exists:clientes,id_cliente',
            'id_livro' => 'required|integer|exists:livros,id_livro',
            'data_prevista_devolucao' => 'required|date|after_or_equal:today',
        ]);
        $idEmprestimo = DB::transaction(fn() => $this->insertLoan($request,
            (int) $data['id_cliente'], (int) $data['id_livro'], $data['data_prevista_devolucao']));
        return response()->json(['message' => 'Empréstimo registrado.',
            'id_emprestimo' => $idEmprestimo], 201);
    }

    private function insertLoan(Request $request, int $clienteId, int $livroId, string $prazo): int
    {
        $book = DB::table('livros')->where('id_livro', $livroId)->lockForUpdate()->first();
        if (!$book || $book->quantidade_disponivel < 1) {
            throw ValidationException::withMessages(['id_livro' => 'Não há exemplares disponíveis.']);
        }
        $emAberto = DB::table('emprestimos')->where('id_cliente', $clienteId)
            ->where('id_livro', $livroId)->where('status', 'EMPRESTADO')->exists();
        if ($emAberto) throw ValidationException::withMessages([
            'id_cliente' => 'Esse cliente já tem um exemplar desse livro emprestado.'
        ]);
        $staff = $request->attributes->get('bibliotecario');
        // Trigger de emprestimo registra o estoque no proprio banco.
        return DB::table('emprestimos')->insertGetId([
            'id_cliente' => $clienteId,
            'id_livro' => $livroId,
            'id_bibliotecario_entrega' => $staff->id_bibliotecario,
            'data_prevista_devolucao' => $prazo,
            'data_retirada' => now('UTC'),
            'status' => 'EMPRESTADO',
        ], 'id_emprestimo');
    }

    public function loans()
    {
        return response()->json(DB::table('emprestimos as e')
            ->join('clientes as c', 'e.id_cliente', '=', 'c.id_cliente')
            ->join('livros as l', 'e.id_livro', '=', 'l.id_livro')
            ->select('e.*', 'c.nome as cliente', 'l.titulo')
            ->orderByRaw("CASE WHEN e.status = 'EMPRESTADO' THEN 0 ELSE 1 END")
            ->orderByDesc('e.data_retirada')->limit(200)->get());
    }

    public function returnLoan(int $id)
    {
        return DB::transaction(function () use ($id) {
            $loan = DB::table('emprestimos')->where('id_emprestimo', $id)->lockForUpdate()->first();
            if (!$loan || $loan->status !== 'EMPRESTADO') {
                return response()->json(['message' => 'Empréstimo inexistente ou já devolvido.'], 409);
            }
            // O trigger SQL identifica o bibliotecario por auth.uid().
            // Com a conexao PostgreSQL do Laravel, propagamos a identidade
            // JA VALIDADA por /auth/v1/user somente nesta transacao.
            $staff = request()->attributes->get('bibliotecario');
            DB::selectOne("SELECT set_config('request.jwt.claim.sub', ?, true)", [$staff->auth_user_id]);
            DB::table('emprestimos')->where('id_emprestimo', $id)->update(['status' => 'DEVOLVIDO']);
            return response()->json(['message' => 'Devolução registrada. Estoque atualizado.']);
        });
    }
}
