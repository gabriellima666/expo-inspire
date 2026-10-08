import { getEvaluations } from './storage';

/**
 * Multi-format Exporter (CSV, JSON, TXT, Clipboard)
 */

export function generateCSVContent(evaluations = []) {
  if (!evaluations || evaluations.length === 0) return '';

  const headers = [
    'ID Avaliação',
    'Data/Hora',
    'Nome do Avaliador',
    'Eixo de Avaliação',
    'Código do Grupo',
    'Nome do Grupo',
    'Critério: Comunicação Escrita/Oral',
    'Critério: Domínio do Conteúdo',
    'Critério: Semiótica das Imagens',
    'Critério: Postura/Comportamento',
    'Observações do Grupo',
    'Avaliação Geral do Evento (1-5)',
    'Grupo Eleito Destaque'
  ];

  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '""';
    const sanitized = String(field).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
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

        rows.push([
          escapeCSV(id),
          escapeCSV(formattedDate),
          escapeCSV(evaluatorName),
          escapeCSV(axisName),
          escapeCSV(groupInfo.groupCode || groupId),
          escapeCSV(groupInfo.groupName || ''),
          escapeCSV(rubric.comunicacao || 'Não avaliado'),
          escapeCSV(rubric.dominio || 'Não avaliado'),
          escapeCSV(rubric.semiotica || 'Não avaliado'),
          escapeCSV(rubric.postura || 'Não avaliado'),
          escapeCSV(groupInfo.observation || ''),
          escapeCSV(overallRating || ''),
          escapeCSV(highlightGroupName || '')
        ].join(';'));
      });
    }
  });

  return '\uFEFF' + [headers.map(escapeCSV).join(';'), ...rows].join('\r\n');
}

export function downloadFile(content, fileName, mimeType) {
  try {
    const blob = new Blob([content], { type: mimeType });
    
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
      return true;
    }

    const encodedUri = 'data:' + mimeType + ',' + encodeURIComponent(content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Erro ao baixar arquivo:', err);
    alert('Erro ao realizar download do arquivo.');
    return false;
  }
}

export function exportToCSV(evaluations) {
  const content = generateCSVContent(evaluations);
  if (!content) {
    alert('Nenhum dado disponível para exportar.');
    return false;
  }
  const dateStr = new Date().toISOString().slice(0, 10);
  return downloadFile(content, `avaliacoes_expo_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToJSON(evaluations) {
  if (!evaluations || evaluations.length === 0) {
    alert('Nenhum dado disponível para exportar.');
    return false;
  }
  const content = JSON.stringify(evaluations, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  return downloadFile(content, `avaliacoes_expo_${dateStr}.json`, 'application/json;charset=utf-8;');
}

export function exportToTXT(evaluations) {
  if (!evaluations || evaluations.length === 0) {
    alert('Nenhum dado disponível para exportar.');
    return false;
  }

  let textReport = `====================================================\n`;
  textReport += `RELATÓRIO DE AVALIAÇÕES - EXPO INSPIRE / INSTITUTO CACAU SHOW\n`;
  textReport += `Data do Relatório: ${new Date().toLocaleString('pt-BR')}\n`;
  textReport += `Total de Registros: ${evaluations.length}\n`;
  textReport += `====================================================\n\n`;

  evaluations.forEach((item, index) => {
    textReport += `----------------------------------------------------\n`;
    textReport += `AVALIAÇÃO #${index + 1} - ID: ${item.id}\n`;
    textReport += `Data/Hora: ${new Date(item.timestamp).toLocaleString('pt-BR')}\n`;
    textReport += `Avaliador: ${item.evaluatorName}\n`;
    textReport += `Eixo: ${item.axisName}\n`;
    textReport += `Nota Geral do Evento: ${item.overallRating} / 5\n`;
    textReport += `Grupo Destaque: ${item.highlightGroupName || 'N/A'}\n\n`;
    
    textReport += `GRUPOS AVALIADOS:\n`;
    if (item.groupEvaluations) {
      Object.values(item.groupEvaluations).forEach(group => {
        textReport += `  * ${group.groupCode} - ${group.groupName}\n`;
        if (group.rubric) {
          Object.entries(group.rubric).forEach(([crit, val]) => {
            textReport += `    - ${crit}: ${val}\n`;
          });
        }
        if (group.observation) {
          textReport += `    - Observações: "${group.observation}"\n`;
        }
      });
    }
    textReport += `\n`;
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  return downloadFile(textReport, `relatorio_avaliacoes_${dateStr}.txt`, 'text/plain;charset=utf-8;');
}
