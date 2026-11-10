-- OPCIONAL: somente para testar numa base NOVA. Nao execute em base real com registros.
-- Obras listadas sao exemplos. Quantidade 0 evita anunciar exemplares inexistentes.
BEGIN;
INSERT INTO public.bibliotecas (nome, endereco, horario_abertura, horario_fechamento)
VALUES ('Biblioteca Demonstracao', 'Ambiente de testes', '08:00', '18:00');
INSERT INTO public.autores (nome, nacionalidade) VALUES
 ('Machado de Assis', 'Brasileira'),
 ('Jane Austen', 'Britanica'),
 ('Franz Kafka', 'Tcheca'),
 ('Mary Shelley', 'Britanica'),
 ('Lima Barreto', 'Brasileira'),
 ('Jules Verne', 'Francesa');
INSERT INTO public.livros
(titulo, tema, secao, edicao, ano_publicacao, sinopse, quantidade_total, id_autor, id_biblioteca, destaque)
SELECT 'Dom Casmurro', 'Literatura brasileira', 'Romance', '1', 1899,
 'Uma das obras mais conhecidas do realismo brasileiro.', 0, a.id_autor, b.id_biblioteca, true
FROM public.autores a CROSS JOIN public.bibliotecas b WHERE a.nome='Machado de Assis' AND b.nome='Biblioteca Demonstracao';
INSERT INTO public.livros
(titulo, tema, secao, edicao, ano_publicacao, sinopse, quantidade_total, id_autor, id_biblioteca, destaque)
SELECT 'Orgulho e Preconceito', 'Romance', 'Classicos', '1', 1813,
 'Relacoes sociais, familia e expectativas na Inglaterra do seculo XIX.', 0, a.id_autor, b.id_biblioteca, true
FROM public.autores a CROSS JOIN public.bibliotecas b WHERE a.nome='Jane Austen' AND b.nome='Biblioteca Demonstracao';
INSERT INTO public.livros
(titulo, tema, secao, edicao, ano_publicacao, sinopse, quantidade_total, id_autor, id_biblioteca, destaque)
SELECT 'A Metamorfose', 'Ficcao', 'Classicos', '1', 1915,
 'A transformacao inesperada de Gregor Samsa.', 0, a.id_autor, b.id_biblioteca, false
FROM public.autores a CROSS JOIN public.bibliotecas b WHERE a.nome='Franz Kafka' AND b.nome='Biblioteca Demonstracao';
INSERT INTO public.livros
(titulo, tema, secao, edicao, ano_publicacao, sinopse, quantidade_total, id_autor, id_biblioteca, destaque)
SELECT 'Frankenstein', 'Ficcao cientifica', 'Classicos', '1', 1818,
 'Uma historia sobre ciencia, criacao e responsabilidade.', 0, a.id_autor, b.id_biblioteca, true
FROM public.autores a CROSS JOIN public.bibliotecas b WHERE a.nome='Mary Shelley' AND b.nome='Biblioteca Demonstracao';
INSERT INTO public.livros
(titulo, tema, secao, edicao, ano_publicacao, sinopse, quantidade_total, id_autor, id_biblioteca, destaque)
SELECT 'Triste Fim de Policarpo Quaresma', 'Literatura brasileira', 'Romance', '1', 1915,
 'Uma satira do nacionalismo e da sociedade brasileira.', 0, a.id_autor, b.id_biblioteca, false
FROM public.autores a CROSS JOIN public.bibliotecas b WHERE a.nome='Lima Barreto' AND b.nome='Biblioteca Demonstracao';
INSERT INTO public.livros
(titulo, tema, secao, edicao, ano_publicacao, sinopse, quantidade_total, id_autor, id_biblioteca, destaque)
SELECT 'Viagem ao Centro da Terra', 'Aventura', 'Ficcao cientifica', '1', 1864,
 'Uma jornada imaginaria atraves do interior do planeta.', 0, a.id_autor, b.id_biblioteca, false
FROM public.autores a CROSS JOIN public.bibliotecas b WHERE a.nome='Jules Verne' AND b.nome='Biblioteca Demonstracao';
COMMIT;
