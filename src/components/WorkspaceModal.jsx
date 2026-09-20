import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderPlus, Layers, Check, Plus, X, ArrowRight, Shield } from 'lucide-react';

export const WorkspaceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { workspaceId, switchWorkspace, savedWorkspaces } = useApp();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleCreateOrSwitch = (targetId) => {
    if (!targetId || !targetId.trim()) return;
    const cleanId = targetId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    switchWorkspace(cleanId);
    setNewWorkspaceName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E6E0D4] max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#6E685F] hover:text-[#1C1B1A] bg-[#F5F2EB] hover:bg-[#EFEAE1] rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D95338]/10 text-[#C84B31] rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#1C1B1A]">Espacios de Trabajo</h3>
            <p className="text-xs text-[#6E685F]">Cambia de sesión o crea un nuevo espacio con otro socio</p>
          </div>
        </div>

        {/* Saved Workspaces List */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1C1B1A] uppercase tracking-wider">
            Tus Espacios Activos
          </label>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {savedWorkspaces.map((wId) => {
              const isActive = wId === workspaceId;
              return (
                <button
                  key={wId}
                  onClick={() => handleCreateOrSwitch(wId)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-[#D95338]/10 border-[#D95338] text-[#C84B31] font-extrabold'
                      : 'bg-[#F9F7F2] border-[#E6E0D4] text-[#1C1B1A] hover:border-[#D95338]/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#D95338]' : 'bg-[#C8C2B7]'}`} />
                    <span className="capitalize text-xs">{wId.replace(/-/g, ' ')}</span>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[#D95338]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Create / Join New Session */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateOrSwitch(newWorkspaceName);
          }}
          className="p-4 bg-[#F5F2EB] rounded-2xl border border-[#E6E0D4] space-y-3"
        >
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-[#D95338]" />
            <span className="text-xs font-bold text-[#1C1B1A]">Crear o Unirte a Otro Espacio</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              required
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Ej: negocio-juan, startup-2..."
              className="flex-1 bg-white border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A] focus:outline-none focus:border-[#D95338]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#D95338] hover:bg-[#C84B31] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
            >
              <span>Entrar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-[#6E685F]">
            Al ingresar un nombre nuevo, se creará una sesión 100% independiente con temas, tareas y horarios propios para ese nuevo socio.
          </p>
        </form>

        <div className="p-3 bg-[#2E5A44]/10 rounded-xl border border-[#2E5A44]/20 flex items-center gap-2 text-xs text-[#2E5A44]">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Cada espacio tiene su propia sincronización aislada en la nube y por QR.</span>
        </div>

      </div>
    </div>
  );
};
