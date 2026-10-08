import initialRespostasJson from '../data/respostas.json';

const STORAGE_KEY = 'avaliacoes_evento';

/**
 * Synchronously retrieves evaluation records from local cache or fallback JSON file
 */
export function getEvaluations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler avaliações do localStorage:', err);
  }
  return initialRespostasJson && Array.isArray(initialRespostasJson)
    ? initialRespostasJson
    : [];
}

/**
 * Asynchronously fetches live evaluations from server (src/data/respostas.json)
 */
export async function fetchEvaluationsFromServer() {
  try {
    const response = await fetch('/api/get-evaluations');
    if (response.ok) {
      const serverList = await response.json();
      if (Array.isArray(serverList)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverList));
        return serverList;
      }
    }
  } catch (err) {
    console.log('Servidor em modo local. Usando cache local de avaliações.');
  }
  return getEvaluations();
}

/**
 * Saves a new evaluation object into local cache and src/data/respostas.json
 */
export async function saveEvaluation(evaluation) {
  try {
    const current = getEvaluations();
    const newRecord = {
      id: 'eval_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...evaluation
    };
    
    // Save to LocalStorage
    const updated = [newRecord, ...current.filter(item => item.id !== newRecord.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Send to Server API to update src/data/respostas.json
    await fetch('/api/save-evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRecord)
    });

    return updated;
  } catch (err) {
    console.error('Erro ao salvar avaliação:', err);
    throw new Error('Não foi possível salvar os dados.');
  }
}

/**
 * Clears all evaluations
 */
export function clearEvaluations() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    fetch('/api/save-evaluation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clearAll: true })
    }).catch(() => {});
    return [];
  } catch (err) {
    return [];
  }
}

export function getEvaluationsCount() {
  return getEvaluations().length;
}

