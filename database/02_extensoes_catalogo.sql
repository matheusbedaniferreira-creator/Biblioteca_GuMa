-- Executar DEPOIS de 01_base_supabase.sql no SQL Editor do Supabase.
-- Adiciona metadados de catalogo. Seguro para reexecutar em banco com a base v2.
BEGIN;
ALTER TABLE public.livros
  ADD COLUMN IF NOT EXISTS ano_publicacao integer,
  ADD COLUMN IF NOT EXISTS sinopse text,
  ADD COLUMN IF NOT EXISTS imagem_capa_url text,
  ADD COLUMN IF NOT EXISTS destaque boolean NOT NULL DEFAULT false;

-- Restricoes com checagem de existencia para manter script reexecutavel.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='chk_livros_ano_publicacao'
      AND conrelid='public.livros'::regclass) THEN
    ALTER TABLE public.livros ADD CONSTRAINT chk_livros_ano_publicacao
      CHECK (ano_publicacao IS NULL OR ano_publicacao BETWEEN 0 AND 2100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_livros_destaque ON public.livros(destaque) WHERE destaque = true;
CREATE INDEX IF NOT EXISTS idx_livros_titulo ON public.livros(titulo);

-- Google fornece normalmente full_name/name e nao necessariamente "nome".
-- Conserva o trigger existente e melhora o nome inicial do perfil.
CREATE OR REPLACE FUNCTION public.criar_cliente_apos_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    INSERT INTO public.clientes (auth_user_id, nome, email)
    VALUES (
      NEW.id,
      LEFT(COALESCE(
        NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'nome'), ''),
        NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
        NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'name'), ''),
        'Novo cliente'
      ), 100),
      NEW.email
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.criar_cliente_apos_signup() FROM PUBLIC, anon, authenticated;
COMMIT;
