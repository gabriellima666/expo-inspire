import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

// Define file paths for src/data/ and root directory
const AXES_SRC_FILE = path.join(__dirname, 'src', 'data', 'eixos_grupos.json');
const AXES_ROOT_FILE = path.join(__dirname, 'eixos_grupos.json');

const EVALS_SRC_FILE = path.join(__dirname, 'src', 'data', 'respostas.json');
const EVALS_ROOT_FILE = path.join(__dirname, 'respostas_avaliacoes.json');

const CSV_SRC_FILE = path.join(__dirname, 'src', 'data', 'respostas.csv');
const CSV_ROOT_FILE = path.join(__dirname, 'respostas_avaliacoes.csv');

// Helper to ensure dir exists
function ensureDir(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Initial default data
const defaultAxes = [
  {
    id: 'eixo-tec',
    name: 'Inteligência Emocional',
    description: '',
    groups: [
      {
        id: 'g101',
        code: 'GRUPO 101',
        name: 'De que maneira a falta de comunicação entre pais e filhos adolescentes gera o afastamento familiar e como isso pode ser minimizado?'
      }
    ]
  }
];

// Helper to read axes file from src/data or root
function readAxesFromDisk() {
  if (fs.existsSync(AXES_SRC_FILE)) {
    try {
      const data = fs.readFileSync(AXES_SRC_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  if (fs.existsSync(AXES_ROOT_FILE)) {
    try {
      const data = fs.readFileSync(AXES_ROOT_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  return defaultAxes;
}

// Helper to write axes to both src/data and root
function writeAxesToDisk(axesData) {
  const jsonStr = JSON.stringify(axesData, null, 2);
  
  ensureDir(AXES_SRC_FILE);
  fs.writeFileSync(AXES_SRC_FILE, jsonStr, 'utf-8');
  fs.writeFileSync(AXES_ROOT_FILE, jsonStr, 'utf-8');
}

// Helper to read evaluations from src/data or root
function readEvaluationsFromDisk() {
  if (fs.existsSync(EVALS_SRC_FILE)) {
    try {
      const data = fs.readFileSync(EVALS_SRC_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  if (fs.existsSync(EVALS_ROOT_FILE)) {
    try {
      const data = fs.readFileSync(EVALS_ROOT_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  return [];
}

// Helper to write evaluations to both src/data and root
function writeEvaluationsToDisk(evalsData) {
  const jsonStr = JSON.stringify(evalsData, null, 2);
  const csvContent = convertJSONToCSV(evalsData);

  ensureDir(EVALS_SRC_FILE);
  fs.writeFileSync(EVALS_SRC_FILE, jsonStr, 'utf-8');
  fs.writeFileSync(EVALS_ROOT_FILE, jsonStr, 'utf-8');

  ensureDir(CSV_SRC_FILE);
  fs.writeFileSync(CSV_SRC_FILE, csvContent, 'utf-8');
  fs.writeFileSync(CSV_ROOT_FILE, csvContent, 'utf-8');
}

function convertJSONToCSV(evaluations = []) {
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
    const sanitized = String(field).replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
    return `"${sanitized}"`;
  };

  const rows = [];
  evaluations.forEach((evalData) => {
    const { id, timestamp, evaluatorName, axisName, groupEvaluations = {}, overallRating, highlightGroupName } = evalData;
    const formattedDate = timestamp ? new Date(timestamp).toLocaleString('pt-BR') : '';
    const groupKeys = Object.keys(groupEvaluations);

    if (groupKeys.length === 0) {
      rows.push([
        escapeCSV(id), escapeCSV(formattedDate), escapeCSV(evaluatorName), escapeCSV(axisName),
        '""', '""', '""', '""', '""', '""', '""', escapeCSV(overallRating || ''), escapeCSV(highlightGroupName || '')
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
          escapeCSV(rubric.comunicacao || 'Nao avaliado'),
          escapeCSV(rubric.dominio || 'Nao avaliado'),
          escapeCSV(rubric.semiotica || 'Nao avaliado'),
          escapeCSV(rubric.postura || 'Nao avaliado'),
          escapeCSV(groupInfo.observation || ''),
          escapeCSV(overallRating || ''),
          escapeCSV(highlightGroupName || '')
        ].join(';'));
      });
    }
  });

  return '\uFEFF' + [headers.map(escapeCSV).join(';'), ...rows].join('\r\n');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=utf-8'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // GET /api/get-axes (Lê de src/data/eixos_grupos.json)
  if (req.url === '/api/get-axes' && req.method === 'GET') {
    const data = readAxesFromDisk();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  }

  // POST /api/save-axes (Salva em src/data/eixos_grupos.json)
  if (req.url === '/api/save-axes' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const updatedAxes = JSON.parse(body);
        writeAxesToDisk(updatedAxes);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, count: updatedAxes.length }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // GET /api/get-evaluations (Lê de src/data/respostas.json)
  if (req.url === '/api/get-evaluations' && req.method === 'GET') {
    const data = readEvaluationsFromDisk();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  }

  // POST /api/save-evaluation (Salva em src/data/respostas.json e respostas.csv)
  if (req.url === '/api/save-evaluation' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        
        if (payload.clearAll) {
          writeEvaluationsToDisk([]);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: true, count: 0 }));
        }

        let existing = readEvaluationsFromDisk();
        existing = [payload, ...existing.filter(item => item.id !== payload.id)];
        writeEvaluationsToDisk(existing);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, count: existing.length }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Static file serving for dist/
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.statusCode = 404;
      return res.end('File not found');
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor Conectado aos arquivos src/data/eixos_grupos.json e src/data/respostas.json na porta ${PORT}`);
});
