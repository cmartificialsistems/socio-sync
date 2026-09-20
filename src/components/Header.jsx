import React from 'react';
import { useApp } from '../context/AppContext';
import { Video, Radio, Flame, CheckSquare, Lightbulb, Settings, Calendar, Compass } from 'lucide-react';

export const Header = ({ activeTab, setActiveTab }) => {
  const { partners, currentUser, switchUser, dailySchedule, meetings, activeMeetingId } = useApp();

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) || meetings[0];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6E0D4] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-2">
          
          {/* Brand Logo & Editorial Studio Badge */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D95338] flex items-center justify-center text-lg shadow-md shadow-[#D95338]/20 border border-[#C84B31]">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl tracking-tight text-[#1C1B1A]">
                  Socio<span className="text-[#D95338]">Sync</span>
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-wider uppercase font-bold bg-[#D95338]/10 text-[#C84B31] border border-[#D95338]/25 rounded-md">
                  STUDIO ARCHITECTURE
                </span>
              </div>
              <p className="text-[11px] text-[#6E685F] tracking-wide hidden sm:block font-medium">
                Ecosistema de Agendamiento, Minutas y Compromisos de Socios
              </p>
            </div>
          </div>

          {/* Live Partner Sync Radar */}
          <div className="hidden lg:flex items-center gap-4 bg-[#F0EBE1] px-4 py-2 rounded-2xl border border-[#DFD8C8]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D95338] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D95338]"></span>
              </span>
              <span className="text-xs font-bold text-[#2D2A26] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#D95338]" />
                Daily Sync: <strong className="text-[#D95338] font-display text-sm">{activeMeeting?.time || '10:00'} AM</strong>
              </span>
            </div>

            <a
              href={dailySchedule.meetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D95338] hover:bg-[#C84B31] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#D95338]/20"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Entrar a Video</span>
            </a>
          </div>

          {/* User Switcher Pill */}
          <div className="flex items-center bg-[#EFEAE1] p-1 rounded-2xl border border-[#DDD6C8]">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#6E685F] px-2.5 hidden md:inline font-bold">
              Viendo como:
            </span>
            {partners.map(p => {
              const isActive = currentUser.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchUser(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#D95338] text-white shadow-md shadow-[#D95338]/25'
                      : 'text-[#6E685F] hover:text-[#1C1B1A] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{p.avatar}</span>
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Studio Navigation Bar */}
        <div className="flex space-x-2 border-t border-[#E6E0D4] py-2 overflow-x-auto">
          {[
            { id: 'reuniones', label: 'Ecosistema de Reuniones', icon: Calendar },
            { id: 'tareas', label: 'Libro de Compromisos (Tareas)', icon: CheckSquare },
            { id: 'ideas', label: 'El Incubador de Ideas', icon: Lightbulb },
            { id: 'ajustes', label: 'Parámetros del Estudio', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#D95338]/10 text-[#C84B31] border border-[#D95338]/30 shadow-sm'
                    : 'text-[#6E685F] hover:text-[#1C1B1A] hover:bg-[#F0EBE1]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D95338]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
