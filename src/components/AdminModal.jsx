import React, { useState } from 'react';
import { Download, Trash2, X, Database, User, Calendar, FileSpreadsheet, CheckCircle2, Copy, Eye, EyeOff, FolderCheck } from 'lucide-react';
import { exportEvaluationsToCSV, generateCSVContent } from '../utils/csvExporter';
import { clearEvaluations, getEvaluations } from '../utils/storage';

export default function AdminModal({ isOpen, onClose, evaluations, onRefreshData }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCSVPreview, setShowCSVPreview] = useState(false);

  if (!isOpen) return null;

  const handleExportCSV = () => {
    const data = getEvaluations();
    const success = exportEvaluationsToCSV(data);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }
  };

  const handleCopyCSV = () => {
    const data = getEvaluations();
    const csvText = generateCSVContent(data);
    if (csvText) {
      navigator.clipboard.writeText(csvText).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 4000);
      }).catch(() => {
        alert('Não foi possível copiar automaticamente para a área de transferência.');
      });
    } else {
      alert('Nenhuma avaliação encontrada para copiar.');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Tem certeza que deseja apagar TODAS as avaliações salvas no dispositivo? Esta ação não pode ser desfeita.')) {
      clearEvaluations();
      onRefreshData();
    }
  };

  const currentCSVText = generateCSVContent(evaluations) || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Painel Administrador — Avaliações
              </h3>
              <p className="text-xs text-slate-400">
                {evaluations.length} {evaluations.length === 1 ? 'avaliação registrada' : 'avaliações registradas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-Save Project File Badge */}
        <div className="bg-indigo-900 text-white p-3.5 px-5 flex items-start space-x-3 border-b border-indigo-800 text-xs">
          <FolderCheck className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-200 block">
              Armazenamento Automático em Arquivos do Projeto (Sem Download):
            </span>
            <p className="text-indigo-100/90 leading-relaxed text-[11px] mt-0.5">
              Todas as respostas enviadas pelos avaliadores são salvas <strong>automaticamente</strong> nos arquivos <code className="bg-indigo-950 px-1 py-0.5 rounded font-mono text-emerald-300">respostas_avaliacoes.json</code> e <code className="bg-indigo-950 px-1 py-0.5 rounded font-mono text-emerald-300">respostas_avaliacoes.csv</code> diretamente na pasta do projeto.
            </p>
          </div>
        </div>

        {/* Export Tools */}
        <div className="bg-emerald-50/80 p-4 border-b border-emerald-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Opções Adicionais de Exportação
                </h4>
                <p className="text-xs text-emerald-800">
                  Você também pode copiar os dados diretamente ou baixar manualmente o arquivo CSV.
                </p>
              </div>
            </div>

            {/* Actions: Download & Copy Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyCSV}
                disabled={evaluations.length === 0}
                className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border transition-all cursor-pointer ${
                  evaluations.length > 0
                    ? 'bg-white hover:bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs active-press'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                title="Copiar texto CSV formatado para colar direto no Excel ou Google Sheets"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-700" />
                <span>Copiar CSV</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={evaluations.length === 0}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-sm cursor-pointer ${
                  evaluations.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active-press'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Baixar CSV</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {downloadSuccess && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-100 p-2.5 rounded-xl border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Arquivo baixado! Lembre-se que o arquivo <code className="font-bold">respostas_avaliacoes.csv</code> já fica salvo na pasta do projeto automaticamente.</span>
            </div>
          )}

          {copySuccess && (
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-100 p-2.5 rounded-xl border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dados CSV copiados com sucesso! Abra o Excel ou Google Sheets e pressione <kbd className="bg-white px-1 rounded font-mono border">Ctrl+V</kbd>.</span>
            </div>
          )}

          {/* Toggle CSV Preview */}
          {evaluations.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowCSVPreview(!showCSVPreview)}
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
              >
                {showCSVPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showCSVPreview ? 'Ocultar Pré-visualização do CSV' : 'Visualizar Conteúdo do CSV'}</span>
              </button>

              {showCSVPreview && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <textarea
                    readOnly
                    rows={4}
                    value={currentCSVText}
                    className="w-full p-2.5 text-[11px] font-mono bg-white border border-emerald-200 rounded-xl text-slate-800 focus:outline-none select-all"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {evaluations.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Nenhuma avaliação salva até o momento
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Quando os avaliadores preencherem o formulário, os dados serão gravados automaticamente nos arquivos da pasta do projeto.
              </p>
            </div>
          ) : (
            evaluations.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-900">
                      {item.evaluatorName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(item.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Eixo:</span>{' '}
                    <span className="font-bold text-slate-800">{item.axisName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Nota Geral Evento:</span>{' '}
                    <span className="font-bold text-amber-600">★ {item.overallRating} / 5</span>
                  </div>
                  <div className="xs:col-span-2">
                    <span className="text-slate-500 font-medium">Grupo Destaque:</span>{' '}
                    <span className="font-bold text-indigo-700">🏆 {item.highlightGroupName || 'Não informado'}</span>
                  </div>
                </div>

                {/* Evaluated Groups details */}
                {item.groupEvaluations && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Grupos Avaliados ({Object.keys(item.groupEvaluations).length}):
                    </span>
                    <div className="space-y-1.5">
                      {Object.values(item.groupEvaluations).map((g, gIdx) => (
                        <div key={gIdx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                          <div className="font-bold text-slate-800">
                            {g.groupCode} — {g.groupName}
                          </div>
                          <div className="text-[11px] text-slate-600 mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
                            {Object.entries(g.rubric || {}).map(([key, val]) => (
                              <div key={key}>
                                <span className="capitalize text-slate-400">{key}:</span>{' '}
                                <span className="font-semibold text-slate-700">{val}</span>
                              </div>
                            ))}
                          </div>
                          {g.observation && (
                            <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded">
                              "{g.observation}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={evaluations.length === 0}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              evaluations.length > 0
                ? 'text-rose-600 hover:bg-rose-100'
                : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpar Banco de Dados</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
