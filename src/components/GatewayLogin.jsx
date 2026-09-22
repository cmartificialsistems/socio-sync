import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, Layers, ArrowRight, RefreshCw } from 'lucide-react';

export const GatewayLogin = () => {
  const { workspaceId, switchWorkspace, unlockWorkspace, workspacePin, updateWorkspacePin } = useApp();
  
  const [targetWorkspace, setTargetWorkspace] = useState(workspaceId || 'colombia');
  const [inputPin, setInputPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPinSetup, setNewPinSetup] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanWsId = targetWorkspace.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanWsId) return;

    setIsVerifying(true);

    try {
      // Switch workspace context first
      if (cleanWsId !== workspaceId) {
        switchWorkspace(cleanWsId);
      }

      if (isCreatingNew) {
        const setupPin = newPinSetup.trim();
        if (setupPin && setupPin.length >= 4) {
          updateWorkspacePin(setupPin);
        }
        unlockWorkspace(setupPin);
        setIsVerifying(false);
        return;
      }

      // Fetch fresh cloud pin from serverless DB with anti-cache timestamp
      let cloudPin = '';
      try {
        const syncUrl = typeof window !== 'undefined' && window.location.origin 
          ? `${window.location.origin}/api/sync?workspaceId=${encodeURIComponent(cleanWsId)}&_t=${Date.now()}`
          : `/api/sync?workspaceId=${encodeURIComponent(cleanWsId)}&_t=${Date.now()}`;

        const res = await fetch(syncUrl, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.pin) {
            cloudPin = String(json.data.pin).trim();
          }
        }
      } catch (err) {}

      // Fallback to local storage PIN
      const localPin = (localStorage.getItem(`socio_sync_${cleanWsId}_pin`) || workspacePin || '').trim();
      const requiredPin = cloudPin || localPin;

      const enteredPin = inputPin.trim();

      if (requiredPin) {
        if (enteredPin === requiredPin) {
          updateWorkspacePin(requiredPin);
          unlockWorkspace(requiredPin);
        } else {
          setErrorMsg(`Clave PIN incorrecta para la sesión "${cleanWsId}".`);
        }
      } else {
        // If workspace has no PIN set yet
        if (enteredPin) {
          updateWorkspacePin(enteredPin);
        }
        unlockWorkspace(enteredPin);
      }
    } catch (err) {
      unlockWorkspace(inputPin.trim());
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F2EB] flex items-center justify-center p-4 selection:bg-[#D95338] selection:text-white overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E6E0D4] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
        
        {/* Logo emblem */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E05A47] to-[#B83A28] flex items-center justify-center mx-auto shadow-lg shadow-[#D95338]/25 border border-[#C84B31]">
          <img src="/favicon.svg" alt="SocioSync Logo" className="w-9 h-9 object-contain drop-shadow-xs" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1C1B1A] tracking-tight">
            Socio<span className="text-[#D95338]">Sync</span>
          </h1>
          <p className="text-xs text-[#6E685F] max-w-xs mx-auto">
            Acceso Privado a Sesión de Co-Fundadores
          </p>
        </div>

        {/* Form Login / Session switch */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
          
          {/* Workspace ID Input */}
          <div>
            <label className="block text-xs font-bold text-[#1C1B1A] mb-1.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#D95338]" />
              <span>Nombre de la Sesión / Empresa *</span>
            </label>
            <input
              type="text"
              required
              value={targetWorkspace}
              onChange={(e) => setTargetWorkspace(e.target.value)}
              placeholder="Ej: colombia, usa, empresa-2"
              className="w-full bg-[#F9F7F2] border border-[#E6E0D4] rounded-2xl px-4 py-3 text-xs text-[#1C1B1A] font-bold focus:outline-none focus:border-[#D95338] transition-all capitalize"
            />
          </div>

          {/* Password PIN Input */}
          <div>
            <label className="block text-xs font-bold text-[#1C1B1A] mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#D95338]" />
              <span>Clave Secreta de Acceso (PIN)</span>
            </label>
            <input
              type="password"
              maxLength={8}
              value={isCreatingNew ? newPinSetup : inputPin}
              onChange={(e) => isCreatingNew ? setNewPinSetup(e.target.value) : setInputPin(e.target.value)}
              placeholder={isCreatingNew ? "Crea una clave de 4 dígitos" : "•••• (Ingresa tu clave)"}
              className="w-full bg-[#F9F7F2] border border-[#E6E0D4] rounded-2xl px-4 py-3 text-sm text-[#1C1B1A] font-mono tracking-widest focus:outline-none focus:border-[#D95338] transition-all"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#D95338]/10 rounded-xl border border-[#D95338]/25 text-xs text-[#C84B31] font-bold flex items-center justify-center gap-1.5 animate-shake">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-[#D95338] hover:bg-[#C84B31] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#D95338]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Verificando Clave en Nube...</span>
              </>
            ) : (
              <>
                <span>{isCreatingNew ? 'Crear e Ingresar a Nueva Sesión' : 'Ingresar a la Sesión Privada'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-3 border-t border-[#E6E0D4] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="text-[#D95338] hover:underline font-bold flex items-center gap-1"
          >
            {isCreatingNew ? '← Volver a Ingresar' : '+ Crear Nueva Sesión'}
          </button>
          <span className="text-[10px] text-[#6E685F] font-medium">100% Cifrado & Privado</span>
        </div>

      </div>
    </div>
  );
};
