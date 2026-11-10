-- SEGURANCA ADICIONAL - executar apos 01_base_supabase.sql e 02_extensoes_catalogo.sql
-- Arquitetura BFF: frontend NUNCA acessa tabelas diretamente no Supabase.
-- Apenas Laravel, por conexao PostgreSQL PRIVADA do backend, acessa os dados.
-- Remove os privilegios previamente concedidos as roles do Data API.
BEGIN;
REVOKE ALL ON TABLE public.autores, public.bibliotecas, public.bibliotecarios,
    public.clientes, public.livros, public.emprestimos, public.solicitacoes
    FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, PUBLIC;
-- Funcao de perfil roda como proprietario (SECURITY DEFINER); as telas nao
-- acessam tabelas pelo SDK no browser. RLS permanece ativo em todas as tabelas.
ALTER TABLE public.autores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bibliotecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bibliotecarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;
COMMIT;
