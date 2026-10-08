import React, { useState } from 'react';
import { Lock, KeyRound, ShieldCheck, X, AlertCircle } from 'lucide-react';

export default function AdminAuthModal({ isOpen, onClose, onAuthenticate }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Default password for testing is 'admin' or '1234'
    if (password.trim() === 'admin' || password.trim() === '1234') {
      setError('');
      setPassword('');
      onAuthenticate();
    } else {
      setError('Senha incorreta! Digite a senha de administrador.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative space-y-5">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Acesso Restrito — Administrador
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Digite a senha de administrador para acessar o painel de relatórios e exportar os dados em CSV.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Digite a senha (ex: admin)"
              className="block w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 text-left">
            💡 <span className="font-semibold">Dica de Acesso de Teste:</span> A senha padrão é <code className="bg-slate-200 px-1 py-0.5 rounded font-bold text-slate-800">admin</code> ou <code className="bg-slate-200 px-1 py-0.5 rounded font-bold text-slate-800">1234</code>.
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            Entrar no Painel Admin
          </button>
        </form>

      </div>
    </div>
  );
}
