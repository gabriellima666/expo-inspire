Atue como um Engenheiro de Front-end Sênior especialista em React, Tailwind CSS e UX/UI para Mobile. 

Sua tarefa é criar um aplicativo React (Single Page Application) de avaliação de projetos. O aplicativo não terá backend. Os dados das avaliações devem ser salvos no `localStorage` do navegador e deve haver um botão dedicado para o administrador "Exportar Resultados para CSV".

### 1. Requisitos de Interface e UX (Mobile-First)
- O layout deve ser otimizado para telas de celular.
- **Importante:** Como matrizes/tabelas ficam ruins no celular, a "Rubrica" deve ser renderizada como uma lista de cards. Para cada critério (linha), exiba botões de seleção (radio buttons estilizados como "pills") para as notas (colunas).

### 2. Estrutura do Formulário
O fluxo de avaliação deve conter os seguintes campos:

**A. Dados Iniciais:**
- Nome do Avaliador (Input de texto)
- Eixo de Avaliação (Select dropdown). *Crie um objeto mockado com 2 a 3 eixos de exemplo.*
- Com base no Eixo selecionado, renderizar dinamicamente os Grupos a serem avaliados.

**B. Avaliação por Grupo:**
Para cada grupo do eixo selecionado, o avaliador deve preencher:
- **Rubrica de Avaliação:**
  - *Critérios (Linhas):* Comunicação Escrita e Oral, Domínio do Conteúdo, Semiótica das Imagens, Postura/ Comportamento.
  - *Notas (Colunas):* Excelente, Muito Bom, Bom, A melhorar.
- **Observação:** (Textarea para o grupo específico).

**C. Fechamento da Avaliação:**
No final da página, após avaliar os grupos:
- Avaliação Geral do Evento: Notas de 1 a 5 (Estilo estrelas ou botões numéricos).
- Grupo Destaque: Um Select dropdown listando os grupos do eixo que ele acabou de avaliar para eleger o melhor.
- Botão "Salvar Avaliação".

### 3. Lógica de Dados e Exportação (Sem Backend)
- Ao clicar em "Salvar Avaliação", o app deve montar um objeto com todos os dados preenchidos e fazer um push para um array no `localStorage`.
- Após salvar, limpe o formulário ou exiba uma mensagem de sucesso.
- Crie um componente/botão isolado (pode ser no rodapé ou no topo) chamado "Exportar para CSV". 
- Quando clicado, esse botão deve ler o array do `localStorage`, converter os objetos em formato CSV (com os cabeçalhos corretos) e forçar o download de um arquivo `avaliacoes_evento.csv`.

### 4. Entregáveis
- Forneça o código completo e funcional em React (pode ser em um único arquivo ou estrutura de componentes lógicos).
- Utilize Tailwind CSS para a estilização (cores claras, botões grandes e amigáveis para o toque).
- Adicione comentários explicando a função que converte o JSON do localStorage para CSV.