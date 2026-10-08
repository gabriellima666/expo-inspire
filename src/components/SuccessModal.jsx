import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, PlusCircle, X } from 'lucide-react';

export default function SuccessModal({ isOpen, onClose, onReset }) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative space-y-5">
        
        {/* Close icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl font-extrabold text-slate-900">
            Avaliação Salva com Sucesso!
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Sua avaliação foi registrada no sistema. Obrigado pela contribuição!
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 cursor-pointer active-press"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Fazer Nova Avaliação</span>
          </button>
        </div>

      </div>
    </div>
  );
}
