-- Complemento de integridade para instalações via 01 + 02 + 04.
-- No projeto Supabase conectado, essas garantias já foram incluídas na migração inicial.
-- Execute este arquivo apenas se instalou os SQLs 01, 02 e 04 em um projeto NOVO.
BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS uq_emprestimo_ativo_cliente_livro
 ON public.emprestimos(id_cliente,id_livro) WHERE status='EMPRESTADO';
CREATE OR REPLACE FUNCTION public.controlar_estoque_emprestimos()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_bibliotecario integer;
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Nao exclua emprestimos: mantenha o historico';
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.status <> 'EMPRESTADO'
           OR NEW.data_devolucao_real IS NOT NULL
           OR NEW.id_bibliotecario_devolucao IS NOT NULL THEN
            RAISE EXCEPTION 'Um emprestimo novo deve iniciar como EMPRESTADO';
        END IF;

        UPDATE public.livros
        SET quantidade_disponivel = quantidade_disponivel - 1
        WHERE id_livro = NEW.id_livro AND quantidade_disponivel > 0;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Livro inexistente ou sem exemplares disponiveis';
        END IF;
        RETURN NEW;
    END IF;

    -- Somente UPDATE: campos de identificacao e auditoria sao imutaveis.
    IF NEW.id_livro IS DISTINCT FROM OLD.id_livro
       OR NEW.id_cliente IS DISTINCT FROM OLD.id_cliente
       OR NEW.id_bibliotecario_entrega IS DISTINCT FROM OLD.id_bibliotecario_entrega
       OR NEW.data_retirada IS DISTINCT FROM OLD.data_retirada
       OR NEW.data_devolucao_real IS DISTINCT FROM OLD.data_devolucao_real
       OR NEW.id_bibliotecario_devolucao IS DISTINCT FROM OLD.id_bibliotecario_devolucao THEN
        RAISE EXCEPTION 'Nao e permitido alterar dados imutaveis do emprestimo';
    END IF;

    IF OLD.status = 'DEVOLVIDO' THEN
        RAISE EXCEPTION 'Emprestimos devolvidos nao podem ser alterados';
    END IF;

    IF NEW.status = 'DEVOLVIDO' THEN
        SELECT b.id_bibliotecario INTO v_bibliotecario
        FROM public.bibliotecarios b
        WHERE b.auth_user_id = auth.uid();

        -- SQL Editor (administrador) e chamadas internas podem nao ter auth.uid().
        -- Pelo site, o RLS so permite a operacao para bibliotecarios autenticados.
        IF v_bibliotecario IS NULL THEN
            RAISE EXCEPTION 'Bibliotecario responsavel pela devolucao nao identificado';
        END IF;
        NEW.data_devolucao_real := now();
        NEW.id_bibliotecario_devolucao := v_bibliotecario;

        UPDATE public.livros
        SET quantidade_disponivel = quantidade_disponivel + 1
        WHERE id_livro = NEW.id_livro;
    ELSIF NEW.status <> 'EMPRESTADO' THEN
        RAISE EXCEPTION 'Transicao de status invalida';
    END IF;
    -- Para emprestimos em aberto, permite alterar apenas o prazo de devolucao.
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.controlar_estoque_emprestimos() FROM PUBLIC, anon, authenticated;
COMMIT;
