import React, { useState } from 'react';
import { useApp, formatTimeFormatted } from '../context/AppContext';
import { Video, Radio, CheckSquare, Lightbulb, Settings, Calendar, Wifi, RefreshCw, QrCode, Layers, Lock } from 'lucide-react';
import { QRTransferModal } from './QRTransferModal';
import { WorkspaceModal } from './WorkspaceModal';

export const Header = ({ activeTab, setActiveTab }) => {
  const { 
    workspaceId, 
    workspacePin,
    lockWorkspace,
    partners, 
    currentUser, 
    switchUser, 
    dailySchedule, 
    meetings, 
    activeMeetingId, 
    syncStatus, 
    manualSyncNow 
  } = useApp();
  
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) || meetings[0];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E0D4] shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-2 py-2">
          
          {/* Top Header Row */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Logo Brand */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#E05A47] to-[#B83A28] flex items-center justify-center p-1.5 sm:p-2 shadow-md shadow-[#D95338]/20 border border-[#C84B31] shrink-0">
                <img src="/favicon.svg" alt="SocioSync Logo" className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-xs" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-lg sm:text-2xl tracking-tight text-[#1C1B1A]">
                    Socio<span className="text-[#D95338]">Sync</span>
                  </span>
                  
                  {/* Sync Badge */}
                  <button 
                    onClick={manualSyncNow}
                    className="px-2 py-0.5 text-[9px] sm:text-[10px] font-mono tracking-wider uppercase font-bold bg-[#D95338]/10 text-[#C84B31] border border-[#D95338]/25 rounded-md flex items-center gap-1"
                    title="Toca para forzar sincronización instantánea"
                  >
                    {syncStatus === 'syncing' ? (
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Wifi className="w-2.5 h-2.5 text-[#2E5A44]" />
                    )}
                    <span>{syncStatus === 'syncing' ? 'Guardando' : 'En Vivo'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-[#6E685F] tracking-wide hidden sm:block font-medium">
                  Ecosistema de Agendamiento, Minutas y Compromisos
                </p>
              </div>
            </div>

            {/* Action Buttons: Workspace Switcher, PIN Lock & QR Transfer */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Workspace Switcher */}
              <button
                onClick={() => setWorkspaceModalOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#F0EBE1] hover:bg-[#E6E0D4] text-[#1C1B1A] border border-[#DFD8C8] rounded-xl text-xs font-bold transition-all shadow-2xs"
                title="Cambiar de sesión o crear nuevo espacio para otro socio"
              >
                <Layers className="w-3.5 h-3.5 text-[#D95338]" />
                <span className="capitalize text-xs font-extrabold hidden xs:inline">{workspaceId.replace(/-/g, ' ')}</span>
                <span className="text-[10px] text-[#6E685F]">▾</span>
              </button>

              {/* Lock Screen Button */}
              <button
                onClick={lockWorkspace}
                className="p-2 bg-[#F0EBE1] hover:bg-[#E6E0D4] text-[#C84B31] border border-[#DFD8C8] rounded-xl text-xs font-bold transition-all"
                title="Bloquear pantalla e ir al Login"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>

              {/* QR Mobile Sync Button */}
              <button
                onClick={() => setQrModalOpen(true)}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-[#D95338] hover:bg-[#C84B31] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                title="Sincronizar o pasar datos al celular vía QR / Enlace"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Pasar a Celular</span>
                <span className="xs:hidden">QR</span>
              </button>
            </div>

            {/* Live Partner Radar (Desktop) */}
            <div className="hidden lg:flex items-center gap-4 bg-[#F0EBE1] px-4 py-2 rounded-2xl border border-[#DFD8C8]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D95338] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D95338]"></span>
                </span>
                <span className="text-xs font-bold text-[#2D2A26] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#D95338]" />
                  Daily Sync: <strong className="text-[#D95338] font-display text-sm">{formatTimeFormatted(activeMeeting?.time) || '10:00 AM'}</strong>
                </span>
              </div>

              <a
                href={activeMeeting?.meetUrl || dailySchedule.meetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D95338] hover:bg-[#C84B31] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#D95338]/20"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Entrar a Video</span>
              </a>
            </div>

            {/* Desktop User Switcher */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={manualSyncNow}
                className="px-3 py-1.5 bg-[#F0EBE1] hover:bg-[#E6E0D4] text-[#1C1B1A] border border-[#DFD8C8] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                title="Sincronizar ahora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-[#D95338]' : ''}`} />
                <span className="font-mono">Actualizar</span>
              </button>

              <div className="flex items-center bg-[#EFEAE1] p-1 rounded-2xl border border-[#DDD6C8]">
                {partners.map(p => {
                  const isActive = currentUser.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => switchUser(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#D95338] text-white shadow-xs'
                          : 'text-[#6E685F] hover:text-[#1C1B1A]'
                      }`}
                    >
                      <span>{p.avatar}</span>
                      <span>{p.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Mobile Dedicated Full-Width Partner Switcher Row */}
          <div className="sm:hidden grid grid-cols-2 gap-1.5 bg-[#EFEAE1] p-1 rounded-xl border border-[#DDD6C8] w-full">
            {partners.map(p => {
              const isActive = currentUser.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchUser(p.id)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all w-full text-center ${
                    isActive
                      ? 'bg-[#D95338] text-white shadow-xs'
                      : 'text-[#6E685F] hover:text-[#1C1B1A]'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span className="truncate">{p.name.split(' ')[0]}</span>
                  {isActive && <span className="text-[9px] opacity-80">(Tú)</span>}
                </button>
              );
            })}
          </div>

          {/* Perfect Mobile Responsive 4-Column Tab Bar */}
          <div className="grid grid-cols-4 gap-1 sm:flex sm:space-x-1.5 border-t border-[#E6E0D4] pt-1.5 w-full">
            {[
              { id: 'reuniones', label: 'Reuniones', icon: Calendar },
              { id: 'tareas', label: 'Compromisos', icon: CheckSquare },
              { id: 'ideas', label: 'Ideas', icon: Lightbulb },
              { id: 'ajustes', label: 'Ajustes', icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all w-full text-center truncate ${
                    isActive
                      ? 'bg-[#D95338]/10 text-[#C84B31] border border-[#D95338]/30 shadow-xs'
                      : 'text-[#6E685F] hover:text-[#1C1B1A] hover:bg-[#F0EBE1]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D95338]' : ''}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </header>

      {/* Modals */}
      <QRTransferModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
      <WorkspaceModal isOpen={workspaceModalOpen} onClose={() => setWorkspaceModalOpen(false)} />
    </>
  );
};
