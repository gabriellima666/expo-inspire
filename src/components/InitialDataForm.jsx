import React from 'react';
import { User, Layers, Info, Layers3 } from 'lucide-react';

export default function InitialDataForm({
  evaluatorName,
  setEvaluatorName,
  selectedAxisId,
  setSelectedAxisId,
  selectedAxis,
  axesList = []
}) {
  return (
    <section className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-5 animate-fade-in">
      
      {/* Step Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-[#806fb0] text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
          1
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Dados Iniciais da Avaliação
          </h2>
          <p className="text-xs text-slate-500">
            Informe seu nome e selecione o eixo de projetos a ser avaliado
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Evaluator Name */}
        <div>
          <label 
            htmlFor="evaluatorName" 
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
          >
            Nome do Avaliador <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#806fb0]">
              <User className="w-4 h-4" />
            </div>
            <input
              id="evaluatorName"
              type="text"
              required
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              placeholder="Ex: Prof. Dr. Carlos Eduardo"
              className="block w-full pl-10 pr-4 py-3 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#806fb0] focus:border-[#806fb0] focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Axis Dropdown */}
        <div>
          <label 
            htmlFor="axisSelect" 
            className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
          >
            Eixo de Avaliação <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#806fb0]">
              <Layers className="w-4 h-4" />
            </div>
            <select
              id="axisSelect"
              required
              value={selectedAxisId}
              onChange={(e) => setSelectedAxisId(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#806fb0] focus:border-[#806fb0] focus:bg-white transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">-- Selecione o Eixo Temático --</option>
              {axesList.map((axis) => (
                <option key={axis.id} value={axis.id}>
                  {axis.name} ({axis.groups ? axis.groups.length : 0} Grupos)
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

        {/* Selected Axis Card Information */}
        {selectedAxis && (
          <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl text-xs space-y-1 text-slate-800 animate-fade-in">
            <div className="flex items-center space-x-2 font-semibold text-[#806fb0]">
              <Info className="w-4 h-4 text-[#806fb0] shrink-0" />
              <span>{selectedAxis.name}</span>
            </div>
            <p className="text-slate-600 pl-6 text-[11px] leading-relaxed">
              {selectedAxis.description || 'Eixo temático para avaliação de projetos.'}
            </p>
            <div className="pl-6 pt-1 flex items-center space-x-1.5 font-bold text-slate-700">
              <Layers3 className="w-3.5 h-3.5 text-[#806fb0]" />
              <span>Grupos neste eixo: {selectedAxis.groups ? selectedAxis.groups.map(g => g.code).join(', ') : 'Nenhum'}</span>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
