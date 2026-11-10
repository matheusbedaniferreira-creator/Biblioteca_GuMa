<?php
namespace App\Support;

use Illuminate\Support\Facades\DB;

final class Catalog
{
    /** Retorna APENAS campos publicos; nenhum dado de cliente e exposto. */
    public static function query()
    {
        return DB::table('livros as l')
            ->leftJoin('autores as a', 'a.id_autor', '=', 'l.id_autor')
            ->leftJoin('bibliotecas as b', 'b.id_biblioteca', '=', 'l.id_biblioteca')
            ->leftJoinSub(
                DB::table('solicitacoes')->select('id_livro')
                    ->selectRaw('COUNT(*) AS total_solicitacoes')->groupBy('id_livro'),
                'pop', 'pop.id_livro', '=', 'l.id_livro'
            )
            ->select('l.id_livro', 'l.titulo', 'l.tema', 'l.secao', 'l.edicao',
                'l.ano_publicacao', 'l.sinopse', 'l.imagem_capa_url', 'l.destaque',
                'l.quantidade_total', 'l.quantidade_disponivel',
                'l.id_autor', 'l.id_biblioteca', 'a.nome as autor',
                'b.nome as biblioteca')
            ->selectRaw('COALESCE(pop.total_solicitacoes, 0) AS popularidade');
    }
}
