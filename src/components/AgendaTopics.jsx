import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommentSection } from './CommentSection';
import { Plus, CheckCircle2, Clock, ArrowRight, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export const AgendaTopics = () => {
  const { 
    topics, 
    activeMeetingId, 
    addTopic, 
    updateTopicStatus, 
    addTopicComment, 
    addActionItem,
    partners 
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Media');
  const [expandedComments, setExpandedComments] = useState({});
  const [filterStatus, setFilterStatus] = useState('Todos');

  const meetingTopics = topics.filter(t => t.meetingId === activeMeetingId);
  const filteredTopics = meetingTopics.filter(t => {
    if (filterStatus === 'Pendientes') return t.status !== 'Resuelto';
    if (filterStatus === 'Resueltos') return t.status === 'Resuelto';
    return true;
  });

  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTopic({ title, description, priority });
    setTitle('');
    setDescription('');
    setPriority('Media');
    setShowAddForm(false);
  };

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConvertToTask = (topic) => {
    addActionItem({
      title: topic.title,
      description: `Derivado del tema a tratar: ${topic.description || topic.title}`,
      assignedTo: 'socio_1',
      priority: topic.priority,
      meetingId: activeMeetingId
    });
    updateTopicStatus(topic.id, 'Resuelto');
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Alta': return 'bg-[#D95338]/10 text-[#C84B31] border-[#D95338]/25';
      case 'Media': return 'bg-[#D98A2B]/10 text-[#B8721D] border-[#D98A2B]/25';
      default: return 'bg-[#2E5A44]/10 text-[#2E5A44] border-[#2E5A44]/25';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6E0D4] p-4 sm:p-6 shadow-xs space-y-5">
      
      {/* Symmetric Responsive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6E0D4]">
        <div>
          <h2 className="font-display text-base sm:text-lg font-extrabold text-[#1C1B1A] flex items-center gap-2">
            <span>📝 Puntos a Tratar en Agenda</span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#D95338]/10 text-[#C84B31] rounded-full">
              {meetingTopics.length}
            </span>
          </h2>
          <p className="text-xs text-[#6E685F] mt-0.5">Temas y minutas para debatir en la sesión actual</p>
        </div>

        {/* Symmetric Controls Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          
          {/* Status Filters */}
          <div className="grid grid-cols-3 bg-[#F5F2EB] p-1 rounded-xl border border-[#E6E0D4] text-xs font-mono text-center w-full sm:w-auto">
            {['Todos', 'Pendientes', 'Resueltos'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center ${
                  filterStatus === st ? 'bg-white text-[#1C1B1A] shadow-xs' : 'text-[#6E685F] hover:text-[#1C1B1A]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Symmetric Add Topic Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#D95338] hover:bg-[#C84B31] text-white rounded-xl text-xs font-bold shadow-xs transition-all w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Tema</span>
          </button>
        </div>
      </div>

      {/* Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTopic} className="p-4 sm:p-5 bg-[#F9F7F2] rounded-2xl border border-[#D95338]/30 space-y-3">
          <h3 className="font-display text-sm font-bold text-[#D95338]">Nuevo Tema a Tratar</h3>
          
          <div>
            <label className="block text-xs font-semibold text-[#6E685F] mb-1">Título del Tema *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Modificar porcentaje de comisión o nuevos precios"
              className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E685F] mb-1">Detalles / Argumentos previos</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexto adicional..."
              className="w-full bg-white border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[#6E685F]">Prioridad:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-white border border-[#E6E0D4] rounded-xl px-3 py-1.5 text-xs text-[#1C1B1A]"
              >
                <option value="Baja">🟢 Baja</option>
                <option value="Media">🟡 Media</option>
                <option value="Alta">🔴 Alta</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-[#6E685F] hover:text-[#1C1B1A]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#D95338] hover:bg-[#C84B31] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Guardar Tema
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Cards List */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[#E6E0D4] rounded-2xl">
            <p className="text-xs text-[#6E685F]">No hay temas en la agenda con este filtro.</p>
          </div>
        ) : (
          filteredTopics.map(topic => {
            const author = partners.find(p => p.id === topic.createdBy);
            const isCommentsOpen = expandedComments[topic.id];

            return (
              <div 
                key={topic.id}
                className={`p-4 rounded-2xl border transition-all ${
                  topic.status === 'Resuelto' 
                    ? 'bg-[#F5F2EB]/50 border-[#E6E0D4] opacity-70' 
                    : topic.status === 'En Discusión'
                    ? 'bg-[#FAF6F0] border-[#D95338]/40 shadow-xs'
                    : 'bg-[#F9F7F2] border-[#E6E0D4] hover:border-[#D1C9B9]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    
                    <button
                      onClick={() => {
                        const nextStatus = topic.status === 'Pendiente' ? 'En Discusión' : topic.status === 'En Discusión' ? 'Resuelto' : 'Pendiente';
                        updateTopicStatus(topic.id, nextStatus);
                      }}
                      className="mt-0.5 transition-transform active:scale-95 shrink-0"
                      title="Cambiar estado del tema"
                    >
                      {topic.status === 'Resuelto' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#2E5A44]" />
                      ) : topic.status === 'En Discusión' ? (
                        <Clock className="w-5 h-5 text-[#D95338] animate-pulse" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-[#A8A196] hover:border-[#D95338]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className={`font-display text-xs sm:text-sm font-bold break-words ${topic.status === 'Resuelto' ? 'line-through text-[#6E685F]' : 'text-[#1C1B1A]'}`}>
                          {topic.title}
                        </h3>
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border rounded-md uppercase ${getPriorityBadge(topic.priority)}`}>
                          {topic.priority}
                        </span>
                        <span className="text-[10px] text-[#6E685F] flex items-center gap-1 font-mono">
                          Por: <strong className="text-[#1C1B1A]">{author?.avatar} {author?.name.split(' ')[0]}</strong>
                        </span>
                      </div>

                      {topic.description && (
                        <p className="text-xs text-[#524E48] mb-2 leading-relaxed break-words">{topic.description}</p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                        <button
                          onClick={() => toggleComments(topic.id)}
                          className="flex items-center gap-1 text-[#6E685F] hover:text-[#D95338] font-semibold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Comentarios ({topic.comments?.length || 0})</span>
                          {isCommentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {topic.status !== 'Resuelto' && (
                          <button
                            onClick={() => handleConvertToTask(topic)}
                            className="flex items-center gap-1 text-[#D95338] hover:underline font-bold text-[11px]"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Crear Compromiso / Tarea</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {isCommentsOpen && (
                  <CommentSection
                    comments={topic.comments || []}
                    onAddComment={(text) => addTopicComment(topic.id, text)}
                    placeholder="Deja una nota o sugerencia..."
                  />
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
