# Referências de bibliotecas e decisões visuais

As referências servem para **padrões de navegação e recursos**, não para copiar layouts, imagens, logotipos ou dados de usuários.

1. **The Seattle Public Library** — https://www.spl.org/ : campo de pesquisa com destaque na navegação inicial e tarefas principais simplificadas. Aplicado: formulário de busca na página inicial e no catálogo.
2. **Open Library** — https://openlibrary.org/trending/now : navegação baseada em títulos de interesse popular/atividade. Aplicado: seção “Mais procurados” calculada pelas solicitações feitas na *própria biblioteca*, e não inventada a partir de rankings externos.
3. **New York Public Library / The Catalog** — https://catalog.nypl.org/ : catálogo pesquisável, disponibilidade e listas de interesse. Aplicado: página de detalhes, disponibilidade de exemplares, filtros e histórico de solicitações. A função “listas salvas” ainda não está implementada.
4. **Open Library API** — https://openlibrary.org/developers/api : referência de metadados de títulos e edições. O projeto **não depende** dessa API para funcionar; o catálogo é mantido pelo bibliotecário no Supabase, evitando API externa como armazenamento principal.

O design mantém paleta verde/creme, hierarquia tipográfica clara e cartões para livros, com contraste e layout responsivo. Não foram copiadas artes protegidas dos sites citados.
