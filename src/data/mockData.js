/**
 * Mock Data for Evaluation Axes, Groups, and Rubric Criteria
 * Formato Matriz: Excelente | Muito Bom | Bom | A melhorar
 */

export const MOCK_AXES = [
  {
    id: 'eixo-tec',
    name: 'Tecnologia, Inovação e Robótica',
    description: 'Projetos focados em desenvolvimento software, protótipos de hardware e automação.',
    groups: [
      { id: 'g101', code: 'GRUPO 101', name: 'EcoTech - Sensores Solares para Cidades Inteligentes' },
      { id: 'g102', code: 'GRUPO 102', name: 'RobotLab - Braço Robótico Assistivo de Baixo Custo' },
      { id: 'g103', code: 'GRUPO 103', name: 'AI Vision - Sistema Inteligente de Triagem de Resíduos' }
    ]
  },
  {
    id: 'eixo-sust',
    name: 'Sustentabilidade e Impacto Social',
    description: 'Iniciativas voltadas à preservação ambiental, saúde pública e desenvolvimento comunitário.',
    groups: [
      { id: 'g201', code: 'GRUPO 201', name: 'ReciclaMais - Plataforma de Logística Reversa' },
      { id: 'g202', code: 'GRUPO 202', name: 'AquaPura - Filtro Portátil de Baixo Custo' },
      { id: 'g203', code: 'GRUPO 203', name: 'HortaUrbana - Irrigação Automatizada e Comunitária' }
    ]
  },
  {
    id: 'eixo-artes',
    name: 'Design, Comunicação e Mídias Digitais',
    description: 'Trabalhos no campo das artes visuais, narrativa interativa, UI/UX e semiótica digital.',
    groups: [
      { id: 'g301', code: 'GRUPO 301', name: 'MídiaVoz - Documentário Interativo sobre Identidade Cultural' },
      { id: 'g302', code: 'GRUPO 302', name: 'Imersão 3D - Galeria em Realidade Aumentada' }
    ]
  }
];

export const RUBRIC_CRITERIA = [
  {
    id: 'comunicacao',
    label: 'Comunicação Escrita e Oral',
    description: 'Clareza na exposição oral, postura articulada e qualidade do material escrito/banner.'
  },
  {
    id: 'dominio',
    label: 'Domínio do Conteúdo',
    description: 'Conhecimento técnico demonstrado pela equipe ao responder perguntas e defender a ideia.'
  },
  {
    id: 'semiotica',
    label: 'Semiótica das Imagens',
    description: 'Uso de elementos visuais, coerência dos gráficos, estética e eficácia comunicativa das imagens.'
  },
  {
    id: 'postura',
    label: 'Postura/ Comportamento',
    description: 'Trabalho em equipe, ética, pontualidade, engajamento e cordialidade no atendimento aos avaliadores.'
  }
];

export const RATING_COLUMNS = [
  { id: 'excelente', label: 'Excelente', value: 'Excelente' },
  { id: 'muito_bom', label: 'Muito Bom', value: 'Muito Bom' },
  { id: 'bom', label: 'Bom', value: 'Bom' },
  { id: 'a_melhorar', label: 'A melhorar', value: 'A melhorar' }
];

export const LIKERT_OPTIONS = RATING_COLUMNS;
