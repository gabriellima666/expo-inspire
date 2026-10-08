import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function autoFileStoragePlugin() {
  return {
    name: 'auto-file-storage-plugin',
    configureServer(server) {
      const AXES_SRC_FILE = path.resolve(process.cwd(), 'src/data/eixos_grupos.json');
      const EVALS_SRC_FILE = path.resolve(process.cwd(), 'src/data/respostas.json');
      const CSV_SRC_FILE = path.resolve(process.cwd(), 'src/data/respostas.csv');

      // 1. Salvar avaliação diretamente em src/data/respostas.json
      server.middlewares.use('/api/save-evaluation', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);

              let existing = [];
              if (fs.existsSync(EVALS_SRC_FILE)) {
                try {
                  existing = JSON.parse(fs.readFileSync(EVALS_SRC_FILE, 'utf-8') || '[]');
                } catch (e) {
                  existing = [];
                }
              }

              if (payload.clearAll) {
                existing = [];
              } else {
                existing = [payload, ...existing.filter(item => item.id !== payload.id)];
              }

              const jsonStr = JSON.stringify(existing, null, 2);
              fs.writeFileSync(EVALS_SRC_FILE, jsonStr, 'utf-8');
              fs.writeFileSync(CSV_SRC_FILE, convertJSONToCSV(existing), 'utf-8');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: existing.length }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });

      // 2. Carregar avaliações de src/data/respostas.json
      server.middlewares.use('/api/get-evaluations', (req, res, next) => {
        if (req.method === 'GET') {
          let data = [];
          if (fs.existsSync(EVALS_SRC_FILE)) {
            try {
              data = JSON.parse(fs.readFileSync(EVALS_SRC_FILE, 'utf-8') || '[]');
            } catch (e) {
              data = [];
            }
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } else {
          next();
        }
      });

      // 3. Salvar eixos e grupos em src/data/eixos_grupos.json
      server.middlewares.use('/api/save-axes', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              const updatedAxes = JSON.parse(body);
              const jsonStr = JSON.stringify(updatedAxes, null, 2);
              fs.writeFileSync(AXES_SRC_FILE, jsonStr, 'utf-8');

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, count: updatedAxes.length }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          next();
        }
      });

      // 4. Carregar eixos de src/data/eixos_grupos.json
      server.middlewares.use('/api/get-axes', (req, res, next) => {
        if (req.method === 'GET') {
          let data = [];
          if (fs.existsSync(AXES_SRC_FILE)) {
            try {
              data = JSON.parse(fs.readFileSync(AXES_SRC_FILE, 'utf-8') || '[]');
            } catch (e) {
              data = [];
            }
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        } else {
          next();
        }
      });
    }
  };
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

export default defineConfig({
  plugins: [react(), tailwindcss(), autoFileStoragePlugin()],
  server: {
    port: 3000,
    open: true,
    watch: {
      ignored: ['**/src/data/**', '**/respostas_avaliacoes.*', '**/eixos_grupos.json']
    }
  }
});
