import { getEvaluations } from './storage';

/**
 * Utilitário de Exportação e Cópia para CSV
 * 
 * Resolve o problema de nome de arquivo UUID no Edge/Chrome garantindo:
 * 1. Uso de MouseEvent explícito e atribuição de data-downloadurl
 * 2. UTF-8 BOM (\uFEFF) para visualização correta dos acentos no Excel
 * 3. Suporte a geração de string CSV para cópia direta para a área de transferência
 */

export function generateCSVContent(customEvaluations = null) {
  const evaluations = customEvaluations && Array.isArray(customEvaluations) && customEvaluations.length > 0
    ? customEvaluations 
    : getEvaluations();

  if (!evaluations || evaluations.length === 0) {
    return null;
  }

  const headers = [
    'ID Avaliacao',
    'Data/Hora',
    'Nome do Avaliador',
    'Eixo de Avaliacao',
    'Codigo do Grupo',
    'Nome do Grupo',
    'Criterio: Comunicacao Escrita/Oral (Likert)',
    'Criterio: Dominio do Conteudo (Likert)',
    'Criterio: Semiotica das Imagens (Likert)',
    'Criterio: Postura/Comportamento (Likert)',
    'Observacoes do Grupo',
    'Avaliacao Geral do Evento (1-5)',
    'Grupo Eleito Destaque'
  ];

  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '""';
    const stringValue = String(field);
    const sanitized = stringValue.replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
    return `"${sanitized}"`;
  };

  const rows = [];

  evaluations.forEach((evalData) => {
    const {
      id,
      timestamp,
      evaluatorName,
      axisName,
      groupEvaluations = {},
      overallRating,
      highlightGroupName
    } = evalData;

    const formattedDate = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : '';

    const groupKeys = Object.keys(groupEvaluations);
    if (groupKeys.length === 0) {
      rows.push([
        escapeCSV(id),
        escapeCSV(formattedDate),
        escapeCSV(evaluatorName),
        escapeCSV(axisName),
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
        escapeCSV(overallRating || ''),
        escapeCSV(highlightGroupName || '')
      ].join(';'));
    } else {
      groupKeys.forEach((groupId) => {
        const groupInfo = groupEvaluations[groupId] || {};
        const rubric = groupInfo.rubric || {};

        const row = [
          escapeCSV(id),
          escapeCSV(formattedDate),
          escapeCSV(evaluatorName),
          escapeCSV(axisName),
          escapeCSV(groupInfo.groupCode || groupId),
          escapeCSV(groupInfo.groupName || ''),
          escapeCSV(rubric.comunicacao || 'Nao avaliado'),
          escapeCSV(rubric.dominio || 'Nao avaliado'),
          escapeCSV(rubric.semiotica || 'Nao avaliado'),
          escapeCSV(rubric.postura || 'Nao avaliado'),
          escapeCSV(groupInfo.observation || ''),
          escapeCSV(overallRating || ''),
          escapeCSV(highlightGroupName || '')
        ];

        rows.push(row.join(';'));
      });
    }
  });

  const csvHeaderString = headers.map(escapeCSV).join(';');
  return '\uFEFF' + [csvHeaderString, ...rows].join('\r\n');
}

export function exportEvaluationsToCSV(customEvaluations = null) {
  const csvContent = generateCSVContent(customEvaluations);

  if (!csvContent) {
    alert('Nenhuma avaliação encontrada para exportar.');
    return false;
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const fileName = `avaliacoes_evento_${todayStr}.csv`;

  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Suporte para Microsoft Edge / IE nativo
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
      return true;
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    link.dataset.downloadurl = ['text/csv', fileName, url].join(':');

    document.body.appendChild(link);

    // Disparar MouseEvent real para forçar o Edge/Chrome a aplicar o atributo 'download' com o nome exato do arquivo
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      window.URL.revokeObjectURL(url);
    }, 4000);

    return true;
  } catch (err) {
    console.error('Erro na exportação por Blob, tentando fallback por Data URI:', err);
    try {
      const encodedUri = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (dataErr) {
      alert('Não foi possível iniciar o download automático.');
      return false;
    }
  }
}
