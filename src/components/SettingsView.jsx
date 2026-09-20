import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, RefreshCw, Download, Clock, Video, Users, Check, UserCheck, Share2, Globe, Github } from 'lucide-react';

export const SettingsView = () => {
  const { 
    dailySchedule, 
    updateSchedule, 
    clearAllData, 
    partners, 
    updatePartner,
    meetings, 
    topics, 
    actionItems, 
    ideas 
  } = useApp();

  const [defaultHour, setDefaultHour] = useState(dailySchedule.defaultHour);
  const [durationMinutes, setDurationMinutes] = useState(dailySchedule.durationMinutes);
  const [meetUrl, setMeetUrl] = useState(dailySchedule.meetUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Partner 1 & 2 states
  const [p1Name, setP1Name] = useState(partners[0]?.name || '');
  const [p1Role, setP1Role] = useState(partners[0]?.role || '');
  const [p1Avatar, setP1Avatar] = useState(partners[0]?.avatar || '🦁');

  const [p2Name, setP2Name] = useState(partners[1]?.name || '');
  const [p2Role, setP2Role] = useState(partners[1]?.role || '');
  const [p2Avatar, setP2Avatar] = useState(partners[1]?.avatar || '⚡');

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    updateSchedule({
      defaultHour,
      durationMinutes: parseInt(durationMinutes),
      meetUrl
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSavePartners = (e) => {
    e.preventDefault();
    updatePartner('socio_1', { name: p1Name, role: p1Role, avatar: p1Avatar });
    updatePartner('socio_2', { name: p2Name, role: p2Role, avatar: p2Avatar });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      partners,
      dailySchedule,
      meetings,
      topics,
      actionItems,
      ideas,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socio-sync-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Configure Partner Identities */}
      <div className="bg-white rounded-3xl border border-[#E6E0D4] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#D95338]/10 text-[#C84B31] rounded-2xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#1C1B1A]">Personalizar Nombres de los Socios</h2>
            <p className="text-xs text-[#6E685F]">Define tu nombre y el de tu socio para personalizar la plataforma</p>
          </div>
        </div>

        <form onSubmit={handleSavePartners} className="pt-4 border-t border-[#E6E0D4] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Partner 1 */}
            <div className="p-4 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D4] space-y-3">
              <h4 className="font-display text-xs font-bold text-[#D95338] uppercase">Socio 1 (Tú)</h4>
              
              <div>
                <label className="block text-[11px] font-semibold text-[#6E685F] mb-1">Tu Nombre</label>
                <input
                  type="text"
                  required
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-[#6E685F] mb-1">Tu Rol</label>
                  <input
                    type="text"
                    value={p1Role}
                    onChange={(e) => setP1Role(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6E685F] mb-1">Emoji</label>
                  <input
                    type="text"
                    value={p1Avatar}
                    onChange={(e) => setP1Avatar(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-center"
                  />
                </div>
              </div>
            </div>

            {/* Partner 2 */}
            <div className="p-4 bg-[#F9F7F2] rounded-2xl border border-[#E6E0D4] space-y-3">
              <h4 className="font-display text-xs font-bold text-[#2E5A44] uppercase">Socio 2 (Tu Socio)</h4>
              
              <div>
                <label className="block text-[11px] font-semibold text-[#6E685F] mb-1">Nombre de tu Socio</label>
                <input
                  type="text"
                  required
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-[#6E685F] mb-1">Rol de tu Socio</label>
                  <input
                    type="text"
                    value={p2Role}
                    onChange={(e) => setP2Role(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6E685F] mb-1">Emoji</label>
                  <input
                    type="text"
                    value={p2Avatar}
                    onChange={(e) => setP2Avatar(e.target.value)}
                    className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-center"
                  />
                </div>
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-[#D95338] hover:bg-[#C84B31] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
          >
            Guardar Nombres de Socios
          </button>
        </form>
      </div>

      {/* Meeting Hours Setup */}
      <div className="bg-white rounded-3xl border border-[#E6E0D4] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-[#D95338]/10 text-[#C84B31] rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#1C1B1A]">Horarios de Reunión</h2>
            <p className="text-xs text-[#6E685F]">Hora diaria predeterminada y enlace permanente</p>
          </div>
        </div>

        <form onSubmit={handleSaveSchedule} className="mt-4 space-y-4 pt-4 border-t border-[#E6E0D4]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6E685F] mb-1">Hora Diaria Predeterminada</label>
              <input
                type="time"
                value={defaultHour}
                onChange={(e) => setDefaultHour(e.target.value)}
                className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-sm text-[#1C1B1A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6E685F] mb-1">Duración (Minutos)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-sm text-[#1C1B1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E685F] mb-1">Enlace Permanente de Videollamada (Meet/Zoom)</label>
            <input
              type="url"
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#D95338] hover:bg-[#C84B31] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              Guardar Horarios
            </button>
            {savedSuccess && (
              <span className="text-xs text-[#2E5A44] font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> ¡Guardado con éxito!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Deployment & Live Sync Section */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#D95338]/30 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-[#D95338] font-display font-extrabold text-sm">
          <Globe className="w-5 h-5" />
          <span>¿Cómo poner la app EN VIVO para compartirla con tu socio?</span>
        </div>
        <p className="text-xs text-[#524E48] leading-relaxed">
          Para que tú y tu socio accedan desde cualquier lugar (teléfono o computadora):
        </p>
        <ol className="list-decimal list-inside text-xs text-[#524E48] space-y-1.5 font-medium">
          <li>Sube esta carpeta a **GitHub** (hemos preparado los comandos en la terminal).</li>
          <li>Conecta tu cuenta de GitHub con **Vercel** o **Netlify** (son gratuitas en 1 clic).</li>
          <li>¡Listo! Tendrás un enlace del tipo <code className="bg-white px-2 py-0.5 rounded border text-[#D95338]">https://tu-socio-sync.vercel.app</code> para ambos.</li>
        </ol>
      </div>

      {/* Backup & Clear Data */}
      <div className="bg-white rounded-3xl border border-[#E6E0D4] p-6 shadow-sm space-y-4">
        <h3 className="font-display text-sm font-extrabold text-[#1C1B1A]">Gestión de Datos</h3>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#F5F2EB] hover:bg-[#EFEAE1] text-[#1C1B1A] border border-[#E6E0D4] rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Respaldos JSON</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Seguro que deseas BORRAR TODOS los temas, tareas e ideas actuales para empezar 100% de cero?')) {
                clearAllData();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#D95338]/10 hover:bg-[#D95338]/20 text-[#C84B31] border border-[#D95338]/25 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Limpiar Datos y Empezar de Cero</span>
          </button>
        </div>
      </div>

    </div>
  );
};
