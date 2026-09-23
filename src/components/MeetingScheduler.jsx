import React, { useState } from 'react';
import { useApp, formatTimeFormatted } from '../context/AppContext';
import { Clock, Video, Plus, Edit3, Flame, Calendar, Link } from 'lucide-react';

export const MeetingScheduler = () => {
  const { 
    meetings, 
    activeMeetingId, 
    setActiveMeetingId, 
    dailySchedule, 
    updateSchedule,
    shiftMeetingTime,
    addMeeting 
  } = useApp();

  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState(dailySchedule.defaultHour);
  const [newNotes, setNewNotes] = useState('');
  const [newMeetUrl, setNewMeetUrl] = useState(dailySchedule.meetUrl || '');

  const [defaultHour, setDefaultHour] = useState(dailySchedule.defaultHour);
  const [durationMinutes, setDurationMinutes] = useState(dailySchedule.durationMinutes);
  const [meetUrl, setMeetUrl] = useState(dailySchedule.meetUrl);

  const activeMeeting = meetings.find(m => m.id === activeMeetingId) || meetings[0];
  const activeVideoUrl = activeMeeting?.meetUrl || dailySchedule.meetUrl;

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMeeting({
      title: newTitle,
      date: newDate,
      time: newTime,
      notes: newNotes,
      meetUrl: newMeetUrl || dailySchedule.meetUrl
    });
    setNewTitle('');
    setNewNotes('');
    setShowNewMeetingModal(false);
  };

  const handleUpdateSchedule = (e) => {
    e.preventDefault();
    updateSchedule({
      defaultHour,
      durationMinutes: parseInt(durationMinutes),
      meetUrl
    });
    setShowEditScheduleModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Studio White Paper Hero Card */}
      <div className="relative bg-white border border-[#E6E0D4] rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D95338]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 text-xs font-mono font-bold tracking-wider uppercase bg-[#D95338]/10 text-[#C84B31] border border-[#D95338]/20 rounded-full flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                SESIÓN ACTIVA
              </span>
              <span className="text-xs text-[#6E685F] font-mono font-semibold">
                📅 {activeMeeting?.date}
              </span>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-[#1C1B1A] leading-tight tracking-tight">
              {activeMeeting?.title}
            </h1>

            {activeMeeting?.notes && (
              <p className="text-xs text-[#524E48] leading-relaxed max-w-2xl font-medium">
                "{activeMeeting.notes}"
              </p>
            )}

            {/* Quick Live Time Adjuster */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full">
              
              <div className="flex items-center justify-between sm:justify-start gap-2 bg-[#F5F2EB] px-4 py-2.5 sm:py-2 rounded-2xl border border-[#E6E0D4] w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#D95338]" />
                  <span className="text-xs text-[#6E685F]">Hora:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-sm text-[#1C1B1A]">
                    {formatTimeFormatted(activeMeeting?.time)}
                  </span>
                  <span className="text-[10px] text-[#6E685F]">({activeMeeting?.duration}m)</span>
                </div>
              </div>

              {/* Instant Time Shifters */}
              <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#F5F2EB] p-1.5 sm:p-1 rounded-2xl border border-[#E6E0D4] w-full sm:w-auto">
                <span className="text-[10px] uppercase font-mono text-[#6E685F] font-bold px-2 hidden sm:inline">Mover hoy:</span>
                
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => shiftMeetingTime(activeMeeting.id, -15)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-[11px] font-mono font-bold bg-white hover:bg-[#EFEAE1] text-[#1C1B1A] rounded-xl border border-[#DFD8C8] shadow-sm text-center"
                    title="Restar 15 minutos"
                  >
                    -15m
                  </button>
                  <button
                    onClick={() => shiftMeetingTime(activeMeeting.id, 15)}
                    className="flex-1 sm:flex-none px-3 py-1.5 text-[11px] font-mono font-bold bg-white hover:bg-[#EFEAE1] text-[#1C1B1A] rounded-xl border border-[#DFD8C8] shadow-sm text-center"
                    title="Sumar 15 minutos"
                  >
                    +15m
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Action Controls */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <a
              href={activeVideoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D95338] hover:bg-[#C84B31] text-white font-display font-extrabold text-sm rounded-2xl shadow-xl shadow-[#D95338]/25 transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Iniciar Video Reunión</span>
            </a>

            <button
              onClick={() => setShowEditScheduleModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5F2EB] hover:bg-[#EFEAE1] text-[#524E48] hover:text-[#1C1B1A] border border-[#E6E0D4] rounded-2xl text-xs font-bold transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Configurar Horario Base & Link</span>
            </button>
          </div>

        </div>

      </div>

      {/* Meeting Explorer */}
      <div className="bg-white rounded-3xl border border-[#E6E0D4] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-base text-[#1C1B1A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D95338]" />
              <span>Explorador de Sesiones</span>
            </h3>
            <p className="text-xs text-[#6E685F]">Selecciona una sesión para revisar minutas y pendientes</p>
          </div>

          <button
            onClick={() => setShowNewMeetingModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#D95338]/10 hover:bg-[#D95338]/20 text-[#C84B31] border border-[#D95338]/25 rounded-xl text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Nueva Sesión</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {meetings.map(m => {
            const isSelected = m.id === activeMeetingId;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMeetingId(m.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-[#D95338]/10 border-[#D95338]/50 shadow-md shadow-[#D95338]/10'
                    : 'bg-[#F9F7F2] border-[#E6E0D4] hover:border-[#D1C9B9]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-[#6E685F] font-semibold">{m.date}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                    m.status === 'En Vivo' ? 'bg-[#D95338]/15 text-[#C84B31]' : 'bg-[#EFEAE1] text-[#6E685F]'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <h4 className="font-display text-xs font-extrabold text-[#1C1B1A] truncate mb-1">{m.title}</h4>
                <p className="text-[11px] text-[#6E685F] flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-[#D95338]" />
                  <span>{formatTimeFormatted(m.time)}</span>
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Base Schedule & Link Modal */}
      {showEditScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E0D4] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[#1C1B1A]">Configurar Horario Base & Enlace de Reunión</h3>
            
            <form onSubmit={handleUpdateSchedule} className="space-y-4">
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
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-sm text-[#1C1B1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Enlace de Videollamada (Google Meet / Zoom / Teams)</label>
                <input
                  type="url"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditScheduleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6E685F] hover:text-[#1C1B1A]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D95338] hover:bg-[#C84B31] text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E0D4] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[#1C1B1A]">Agendar Nueva Sesión</h3>
            
            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Título de la Sesión *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Revisión Financiera Mensual"
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6E685F] mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6E685F] mb-1">Hora</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Enlace de Videollamada (opcional)</label>
                <input
                  type="url"
                  value={newMeetUrl}
                  onChange={(e) => setNewMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Notas u objetivo</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Escribe el propósito..."
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6E685F] hover:text-[#1C1B1A]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D95338] hover:bg-[#C84B31] text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Crear Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
