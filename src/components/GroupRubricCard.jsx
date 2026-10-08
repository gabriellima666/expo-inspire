import React from 'react';
import { RUBRIC_CRITERIA, RATING_COLUMNS } from '../data/mockData';
import { CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export default function GroupRubricCard({
  group,
  groupIndex,
  groupData,
  onUpdateRubric,
  onUpdateObservation
}) {
  const rubricState = groupData?.rubric || {};
  const observation = groupData?.observation || '';

  const completedCount = RUBRIC_CRITERIA.filter(c => rubricState[c.id]).length;
  const isFullyCompleted = completedCount === RUBRIC_CRITERIA.length;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200/80 space-y-5 animate-fade-in relative overflow-hidden">
      
      {/* Institutional Accent Top Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-all ${isFullyCompleted ? 'bg-[#c1d117]' : 'bg-[#806fb0]'}`} />

      {/* Group Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-[#806fb0] text-white tracking-wider">
              {group.code}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Projeto #{groupIndex + 1}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            {group.name}
          </h3>
        </div>

        {/* Status Pill */}
        <div className="self-start sm:self-auto">
          {isFullyCompleted ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Concluído (4/4)</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>{completedCount} de {RUBRIC_CRITERIA.length} critérios</span>
            </span>
          )}
        </div>
      </div>

      {/* Radio Matrix Rubric (Estilo Google Forms com cores institucionais) */}
      <div className="overflow-x-auto -mx-2 px-2 py-1">
        <table className="w-full text-left border-collapse min-w-[540px]">
          
          {/* Header Row: Column Titles */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-3 px-3 w-2/5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Critérios
              </th>
              {RATING_COLUMNS.map((col) => (
                <th key={col.id} className="py-3 px-2 text-center text-xs font-bold text-slate-800 w-1/7">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Matrix Rows: Criteria & Radios */}
          <tbody className="divide-y divide-slate-100">
            {RUBRIC_CRITERIA.map((criterion) => {
              const selectedValue = rubricState[criterion.id];

              return (
                <tr key={criterion.id} className="hover:bg-purple-50/20 transition-colors">
                  
                  {/* Criterion Title */}
                  <td className="py-4 px-3 text-xs sm:text-sm font-semibold text-slate-800 pr-4">
                    {criterion.label}
                  </td>

                  {/* Radio Button Cells */}
                  {RATING_COLUMNS.map((col) => {
                    const isChecked = selectedValue === col.value;

                    return (
                      <td
                        key={col.id}
                        onClick={() => onUpdateRubric(group.id, criterion.id, col.value)}
                        className="py-4 px-2 text-center cursor-pointer select-none group"
                      >
                        <div className="flex items-center justify-center">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              isChecked
                                ? 'border-[#806fb0] bg-[#806fb0] shadow-xs scale-110 ring-2 ring-[#c1d117]/50'
                                : 'border-slate-300 bg-white group-hover:border-[#806fb0] group-hover:bg-purple-50/30'
                            }`}
                          >
                            {isChecked && (
                              <div className="w-2.5 h-2.5 rounded-full bg-white animate-fade-in" />
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

      {/* Observation Textarea */}
      <div className="pt-2 border-t border-slate-100">
        <label
          htmlFor={`obs-${group.id}`}
          className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#806fb0]" />
          <span>Observações para o {group.code}</span>
        </label>
        <textarea
          id={`obs-${group.id}`}
          rows={3}
          value={observation}
          onChange={(e) => onUpdateObservation(group.id, e.target.value)}
          placeholder={`Escreva observações ou comentários adicionais para o ${group.name}...`}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#806fb0] focus:border-[#806fb0] focus:bg-white transition-all outline-none resize-y placeholder:text-slate-400"
        />
      </div>

    </div>
  );
}
