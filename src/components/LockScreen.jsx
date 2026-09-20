import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export const LockScreen = () => {
  const { workspaceId, partners, unlockWorkspace, workspacePin } = useApp();
  const [inputPin, setInputPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePinSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const success = unlockWorkspace(inputPin);
    if (!success) {
      setErrorMsg('Código PIN incorrecto. Verifica con tu socio.');
      setInputPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F2EB] flex items-center justify-center p-4 selection:bg-[#D95338] selection:text-white">
      <div className="bg-white rounded-3xl border border-[#E6E0D4] max-w-md w-full p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
        
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E05A47] to-[#B83A28] flex items-center justify-center mx-auto shadow-lg shadow-[#D95338]/25 border border-[#C84B31]">
          <Lock className="w-8 h-8 text-white" />
        </div>

        {/* Workspace Title */}
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-[#D95338]/10 text-[#C84B31] text-[10px] font-mono uppercase font-bold rounded-full tracking-wider">
            Espacio Privado • {workspaceId.toUpperCase()}
          </span>
          <h2 className="font-display text-2xl font-extrabold text-[#1C1B1A]">
            Socio<span className="text-[#D95338]">Sync</span> Protegido
          </h2>
          <p className="text-xs text-[#6E685F] max-w-xs mx-auto">
            Este espacio de trabajo contiene información confidencial entre socios. Ingresa tu código PIN para desbloquear.
          </p>
        </div>

        {/* Partners Badges preview */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D4]">
          {partners.map(p => (
            <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-xl border border-[#E6E0D4] text-xs font-bold text-[#1C1B1A]">
              <span>{p.avatar}</span>
              <span>{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* PIN Entry Form */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1B1A] mb-2 flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#D95338]" />
              <span>Código PIN de Acceso</span>
            </label>
            
            <input
              type="password"
              maxLength={8}
              required
              autoFocus
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              placeholder="••••"
              className="w-48 mx-auto text-center tracking-[0.5em] text-2xl font-mono font-bold bg-[#F5F2EB] border-2 border-[#E6E0D4] focus:border-[#D95338] rounded-2xl px-4 py-3 text-[#1C1B1A] focus:outline-none transition-all shadow-inner"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#D95338]/10 rounded-xl border border-[#D95338]/25 text-xs text-[#C84B31] font-bold flex items-center justify-center gap-1.5 animate-bounce">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#D95338] hover:bg-[#C84B31] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#D95338]/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Desbloquear Espacio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[#E6E0D4]">
          <p className="text-[10px] text-[#6E685F]">
            🛡️ Los datos están cifrados y solo se revelan al ingresar el PIN correcto.
          </p>
        </div>

      </div>
    </div>
  );
};
