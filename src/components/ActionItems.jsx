import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommentSection } from './CommentSection';
import { Plus, Calendar, MessageSquare, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ActionItems = () => {
  const { 
    actionItems, 
    addActionItem, 
    updateActionStatus, 
    addActionComment, 
    currentUser, 
    partners 
  } = useApp();
  const safeCurrentUser = currentUser || partners[0] || { id: 'socio_1', name: 'Socio 1', avatar: '👤' };
  const safeOtherPartner = partners.find(p => p && p.id !== safeCurrentUser.id) || partners[1] || { id: 'socio_2', name: 'Socio 2', avatar: '👤' };

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [expandedComments, setExpandedComments] = useState({});

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(safeCurrentUser.id);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState('Media');

  const filteredItems = (actionItems || []).filter(item => {
    if (filterAssignee === 'mis') {
      if (item.assignedTo !== safeCurrentUser.id && item.assignedTo !== 'ambos') return false;
    } else if (filterAssignee === 'socio') {
      if (item.assignedTo !== safeOtherPartner.id && item.assignedTo !== 'ambos') return false;
    }
    if (filterStatus === 'pendientes') return item.status !== 'Completada';
    if (filterStatus === 'completadas') return item.status === 'Completada';
    return true;
  });

  const myTasks = filteredItems.filter(i => i.assignedTo === safeCurrentUser.id || i.assignedTo === 'ambos');
  const socioTasks = filteredItems.filter(i => i.assignedTo === safeOtherPartner.id || i.assignedTo === 'ambos');

  const handleCreateAction = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addActionItem({
      title,
      description,
      assignedTo,
      dueDate,
      priority
    });
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTaskCard = (item) => {
    const isCompleted = item.status === 'Completada';
    const isCommentsOpen = expandedComments[item.id];
    const isOverdue = !isCompleted && item.dueDate < new Date().toISOString().split('T')[0];

    return (
      <div
        key={item.id}
        className={`p-4 rounded-2xl border transition-all ${
          isCompleted
            ? 'bg-[#F5F2EB]/60 border-[#E6E0D4] opacity-70'
            : isOverdue
            ? 'bg-[#FDF3F2] border-[#D95338]/40'
            : 'bg-[#F9F7F2] border-[#E6E0D4] hover:border-[#D1C9B9]'
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => updateActionStatus(item.id, isCompleted ? 'Pendiente' : 'Completada')}
            className="mt-0.5 transition-transform active:scale-90"
            title={isCompleted ? "Marcar pendiente" : "Marcar completada"}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-[#2E5A44]" />
            ) : (
              <div className="w-5 h-5 rounded-md border-2 border-[#A8A196] hover:border-[#2E5A44]" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <h3 className={`font-display text-xs md:text-sm font-bold ${isCompleted ? 'line-through text-[#6E685F]' : 'text-[#1C1B1A]'}`}>
                {item.title}
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border rounded-md uppercase ${
                item.priority === 'Alta' ? 'bg-[#D95338]/10 text-[#C84B31] border-[#D95338]/25' : 'bg-[#D98A2B]/10 text-[#B8721D] border-[#D98A2B]/25'
              }`}>
                {item.priority}
              </span>
            </div>

            {item.description && (
              <p className="text-xs text-[#524E48] mb-2 leading-relaxed">{item.description}</p>
            )}

            <div className="flex items-center justify-between gap-2 mt-2 text-xs text-[#6E685F] font-mono">
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-[#D95338] font-bold' : ''}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.dueDate}</span>
                {isOverdue && <AlertTriangle className="w-3 h-3 text-[#D95338]" />}
              </span>

              <button
                onClick={() => toggleComments(item.id)}
                className="flex items-center gap-1 text-[#6E685F] hover:text-[#D95338] font-semibold"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>({item.comments?.length || 0})</span>
              </button>
            </div>

            {isCommentsOpen && (
              <CommentSection
                comments={item.comments || []}
                onAddComment={(text) => addActionComment(item.id, text)}
                placeholder="Escribe una actualización..."
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6E0D4] p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6E0D4]">
        <div>
          <h2 className="font-display text-lg font-extrabold text-[#1C1B1A] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2E5A44]" />
            <span>Libro de Compromisos (Tareas)</span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#2E5A44]/10 text-[#2E5A44] rounded-full">
              {actionItems.filter(i => i.status !== 'Completada').length} activos
            </span>
          </h2>
          <p className="text-xs text-[#6E685F]">Responsabilidades divididas entre socios con seguimiento claro</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-1.5 text-xs text-[#1C1B1A] font-mono focus:outline-none"
          >
            <option value="todos">👥 Vista Dividida (Ambos)</option>
            <option value="mis">👤 Solo Mis Compromisos</option>
            <option value="socio">🤝 Solo Compromisos de Socio</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2E5A44] hover:bg-[#234534] text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Compromiso</span>
          </button>
        </div>
      </div>

      {/* Split Ledger View */}
      {filterAssignee === 'todos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: My Tasks */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E6E0D4] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D4]">
              <h3 className="font-display text-xs font-bold text-[#D95338] uppercase tracking-wider flex items-center gap-1.5">
                <span>{safeCurrentUser.avatar}</span>
                <span>Tus Compromisos ({myTasks.filter(t => t.status !== 'Completada').length})</span>
              </h3>
            </div>
            <div className="space-y-3">
              {myTasks.length === 0 ? (
                <p className="text-xs text-[#6E685F] text-center py-6">No tienes tareas pendientes activas.</p>
              ) : (
                myTasks.map(renderTaskCard)
              )}
            </div>
          </div>

          {/* Column 2: Partner's Tasks */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E6E0D4] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D4]">
              <h3 className="font-display text-xs font-bold text-[#2E5A44] uppercase tracking-wider flex items-center gap-1.5">
                <span>{safeOtherPartner.avatar}</span>
                <span>Compromisos de {safeOtherPartner.name?.split(' ')[0]} ({socioTasks.filter(t => t.status !== 'Completada').length})</span>
              </h3>
            </div>
            <div className="space-y-3">
              {socioTasks.length === 0 ? (
                <p className="text-xs text-[#6E685F] text-center py-6">Tu socio no tiene tareas pendientes activas.</p>
              ) : (
                socioTasks.map(renderTaskCard)
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(renderTaskCard)}
        </div>
      )}

      {/* Modal for New Action Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E0D4] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[#1C1B1A]">Nuevo Compromiso de Socio</h3>

            <form onSubmit={handleCreateAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Título de la Tarea *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Enviar reporte de ventas a inversores"
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Descripción / Entregables</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles específicos..."
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6E685F] mb-1">Asignar a</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.id}>{p.avatar} {p.name}</option>
                    ))}
                    <option value="ambos">👥 Ambos (Compartido)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E685F] mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                >
                  <option value="Baja">🟢 Baja</option>
                  <option value="Media">🟡 Media</option>
                  <option value="Alta">🔴 Alta</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6E685F] hover:text-[#1C1B1A]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2E5A44] hover:bg-[#234534] text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Crear Compromiso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
