import React from 'react';
import { Star, Trophy, Save, Sparkles } from 'lucide-react';

export default function FinalizingForm({
  overallRating,
  setOverallRating,
  highlightGroupId,
  setHighlightGroupId,
  groups,
  onSubmit,
  isFormValid
}) {
  const ratingLabels = {
    1: 'Muito Fraco',
    2: 'Regular',
    3: 'Bom',
    4: 'Muito Bom',
    5: 'Excelente / Impecável'
  };

  return (
    <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-6 animate-fade-in">
      
      {/* Step Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-[#806fb0] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
          3
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Fechamento da Avaliação
          </h2>
          <p className="text-xs text-slate-500">
            Dê uma nota geral ao evento e escolha o Grupo Destaque do eixo
          </p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Overall Event Rating (1 to 5 Stars) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">
            Avaliação Geral do Evento <span className="text-rose-500">*</span>
          </label>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-all ${
                      star <= overallRating
                        ? 'fill-[#806fb0] text-[#806fb0] drop-shadow-xs'
                        : 'text-slate-300 hover:text-purple-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-center h-5">
              {overallRating > 0 ? (
                <span className="text-xs font-extrabold text-[#806fb0] bg-purple-100/80 px-3 py-0.5 rounded-full border border-purple-200">
                  {overallRating} / 5 — {ratingLabels[overallRating]}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Clique nas estrelas para avaliar (1 a 5)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Group Highlight Dropdown */}
        <div>
          <label 
            htmlFor="highlightGroup" 
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center space-x-1"
          >
            <Trophy className="w-4 h-4 text-[#806fb0]" />
            <span>Eleger Grupo Destaque do Eixo <span className="text-rose-500">*</span></span>
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#806fb0]">
              <Sparkles className="w-4 h-4 text-[#806fb0]" />
            </div>
            <select
              id="highlightGroup"
              required
              value={highlightGroupId}
              onChange={(e) => setHighlightGroupId(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#806fb0] focus:border-[#806fb0] focus:bg-white transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">-- Selecione o Grupo que mais se destacou --</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.code} — {group.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Big Submit Button with Primary #806fb0 and Secondary #c1d117 */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSubmit}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center space-x-2.5 transition-all shadow-lg active-press cursor-pointer ${
              isFormValid
                ? 'bg-[#806fb0] hover:bg-[#685796] text-white shadow-purple-900/20 ring-2 ring-[#c1d117]/60'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Save className="w-5 h-5 text-[#c1d117]" />
            <span>Salvar Avaliação</span>
          </button>
          {!isFormValid && (
            <p className="text-[11px] text-center text-slate-500 mt-2">
              * Preencha seu nome, selecione o eixo, marque todas as rubricas na matriz dos grupos, dê nota ao evento e elenque o grupo destaque.
            </p>
          )}
        </div>

      </div>

    </section>
  );
}
