<?php
namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MeController
{
    public function show(Request $request)
    {
        return response()->json([
            'role' => $request->attributes->get('bibliotecario') ? 'bibliotecario' : 'cliente',
            'cliente' => $request->attributes->get('cliente'),
            'bibliotecario' => $request->attributes->get('bibliotecario'),
        ]);
    }

    public function update(Request $request)
    {
        $cliente = $request->attributes->get('cliente');
        if (!$cliente) return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
        $data = $request->validate([
            'nome' => 'required|string|min:2|max:100',
            'telefone' => 'nullable|string|max:20',
        ]);
        DB::table('clientes')->where('id_cliente', $cliente->id_cliente)->update($data);
        return response()->json(DB::table('clientes')->where('id_cliente', $cliente->id_cliente)->first());
    }

    public function loans(Request $request)
    {
        $cliente = $request->attributes->get('cliente');
        if (!$cliente) return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
        return response()->json(DB::table('emprestimos as e')
            ->join('livros as l', 'e.id_livro', '=', 'l.id_livro')
            ->where('e.id_cliente', $cliente->id_cliente)
            ->select('e.*', 'l.titulo')
            ->orderByDesc('e.data_retirada')->get());
    }

    public function requests(Request $request)
    {
        $cliente = $request->attributes->get('cliente');
        if (!$cliente) return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
        return response()->json(DB::table('solicitacoes as s')
            ->join('livros as l', 'l.id_livro', '=', 's.id_livro')
            ->where('s.id_cliente', $cliente->id_cliente)
            ->select('s.*', 'l.titulo')->orderByDesc('s.data_solicitacao')->get());
    }

    public function requestBook(Request $request)
    {
        $cliente = $request->attributes->get('cliente');
        if (!$cliente) return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
        $data = $request->validate(['id_livro' => 'required|integer|exists:livros,id_livro']);
        $id = (int) $data['id_livro'];
        return DB::transaction(function () use ($cliente, $id) {
            $livro = DB::table('livros')->where('id_livro', $id)->lockForUpdate()->first();
            if (!$livro || $livro->quantidade_disponivel < 1) {
                throw ValidationException::withMessages(['id_livro' => 'Este livro está indisponível no momento.']);
            }
            $jaSolicitou = DB::table('solicitacoes')->where('id_cliente', $cliente->id_cliente)
                ->where('id_livro', $id)->where('status', 'PENDENTE')->exists();
            if ($jaSolicitou) throw ValidationException::withMessages([
                'id_livro' => 'Você já tem uma solicitação pendente para este livro.'
            ]);
            $jaEmprestado = DB::table('emprestimos')->where('id_cliente', $cliente->id_cliente)
                ->where('id_livro', $id)->where('status', 'EMPRESTADO')->exists();
            if ($jaEmprestado) throw ValidationException::withMessages([
                'id_livro' => 'Você já está com este livro emprestado.'
            ]);
            $solicitacaoId = DB::table('solicitacoes')->insertGetId([
                'id_cliente' => $cliente->id_cliente, 'id_livro' => $id,
                'status' => 'PENDENTE', 'data_solicitacao' => now(),
            ], 'id_solicitacao');
            return response()->json(['message' => 'Solicitação enviada. Aguarde a confirmação da biblioteca.',
                'id_solicitacao' => $solicitacaoId], 201);
        });
    }

    public function cancelRequest(Request $request, int $id)
    {
        $cliente = $request->attributes->get('cliente');
        if (!$cliente) return response()->json(['message' => 'Perfil de cliente não encontrado.'], 403);
        $updated = DB::table('solicitacoes')->where('id_solicitacao', $id)
            ->where('id_cliente', $cliente->id_cliente)->where('status', 'PENDENTE')
            ->update(['status' => 'CANCELADA']);
        return $updated ? response()->json(['message' => 'Solicitação cancelada.'])
            : response()->json(['message' => 'Solicitação não encontrada ou já processada.'], 409);
    }
}
