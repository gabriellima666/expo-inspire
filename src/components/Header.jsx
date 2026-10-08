import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

export default function Header({ isAdminMode, onOpenAuth, onOpenAdmin, onLogoutAdmin }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          
          {/* Institution & Event Logos */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Logo 1: Instituto Cacau Show */}
            <div className="h-10 sm:h-12 flex items-center justify-center p-1 bg-white rounded-xl border border-slate-100 shadow-2xs">
              <img
                src="/logo-instituto.png"
                alt="Instituto Cacau Show"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 hidden xs:block" />

            {/* Logo 2: Expo Inspire */}
            <div className="h-10 sm:h-12 flex items-center justify-center">
              <img
                src="/logo-expo-inspire.png"
                alt="Expo Inspire"
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </div>

            {/* Role Badge */}
            <div className="hidden md:block">
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                isAdminMode 
                  ? 'bg-purple-100 text-[#806fb0] border-purple-200' 
                  : 'bg-[#c1d117]/20 text-slate-800 border-[#c1d117]/40'
              }`}>
                {isAdminMode ? 'Administrador' : 'Avaliador'}
              </span>
            </div>

          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            {isAdminMode ? (
              <>
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center space-x-1.5 bg-[#806fb0] hover:bg-[#685796] text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-sm active-press cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c1d117]" />
                  <span>Painel Admin</span>
                </button>
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-xs py-2 px-2 rounded-xl transition-all cursor-pointer"
                  title="Sair do Modo Admin"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl border border-slate-200 transition-all cursor-pointer"
                title="Área restrita ao administrador"
              >
                <Lock className="w-3.5 h-3.5 text-[#806fb0]" />
                <span className="hidden xs:inline">Acesso Admin</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
