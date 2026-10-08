import initialAxesJson from '../data/eixos_grupos.json';

const AXES_STORAGE_KEY = 'eixos_grupos_expo';

/**
 * Synchronously retrieves axes from local cache or fallback JSON file
 */
export function getAxes() {
  try {
    const data = localStorage.getItem(AXES_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler eixos do cache local:', err);
  }
  return initialAxesJson && Array.isArray(initialAxesJson)
    ? initialAxesJson
    : [];
}

/**
 * Asynchronously fetches live axes & groups from server (src/data/eixos_grupos.json)
 */
export async function fetchAxesFromServer() {
  try {
    const response = await fetch('/api/get-axes');
    if (response.ok) {
      const axesList = await response.json();
      if (Array.isArray(axesList)) {
        localStorage.setItem(AXES_STORAGE_KEY, JSON.stringify(axesList));
        return axesList;
      }
    }
  } catch (err) {
    console.log('Servidor em modo local ou offline. Usando cache de eixos.');
  }
  return getAxes();
}

/**
 * Saves updated axes and groups list to server (src/data/eixos_grupos.json) and local cache
 */
export async function saveAxes(axesList) {
  try {
    localStorage.setItem(AXES_STORAGE_KEY, JSON.stringify(axesList));

    const res = await fetch('/api/save-axes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(axesList)
    });

    if (res.ok) {
      console.log('✅ Eixos salvos com sucesso em src/data/eixos_grupos.json');
    }
    return axesList;
  } catch (err) {
    console.warn('Eixos salvos localmente.');
    return axesList;
  }
}

/**
 * Resets axes to initial file data
 */
export function resetAxesToDefault() {
  try {
    localStorage.removeItem(AXES_STORAGE_KEY);
    const defaultData = initialAxesJson && Array.isArray(initialAxesJson) ? initialAxesJson : [];
    saveAxes(defaultData);
    return defaultData;
  } catch (err) {
    return initialAxesJson || [];
  }
}

