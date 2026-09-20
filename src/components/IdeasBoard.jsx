import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CommentSection } from './CommentSection';
import { Lightbulb, Plus, Flame, ArrowRight, MessageSquare, ChevronDown, ChevronUp, Tag, Compass } from 'lucide-react';

export const IdeasBoard = () => {
  const { 
    ideas, 
    addIdea, 
    toggleVoteIdea, 
    addIdeaComment, 
    convertIdeaToTopic, 
    currentUser 
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Nuevos Servicios');

  const categories = ['Nuevos Servicios', 'Optimización', 'Inversiones', 'Estrategia', 'Alianzas'];

  const handleCreateIdea = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addIdea({ title, description, category });
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E6E0D4] p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E0D4]">
        <div>
          <h2 className="font-display text-lg font-extrabold text-[#1C1B1A] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#D98A2B]" />
            <span>El Incubador de Ideas de Negocio</span>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-[#D98A2B]/10 text-[#B8721D] rounded-full">
              {ideas.length} propuestas
            </span>
          </h2>
          <p className="text-xs text-[#6E685F]">Espacio de incubación para validar oportunidades antes de agendarlas</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#D98A2B] hover:bg-[#B8721D] text-white rounded-xl text-xs font-extrabold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Proponer Nueva Idea</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map(idea => {
          const hasVoted = idea.votes.includes(currentUser.id);
          const isCommentsOpen = expandedComments[idea.id];

          return (
            <div
              key={idea.id}
              className="bg-[#F9F7F2] border border-[#E6E0D4] hover:border-[#D98A2B]/50 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-[#D98A2B]/10 text-[#B8721D] border border-[#D98A2B]/20 rounded-lg flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    {idea.category}
                  </span>

                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md ${
                    idea.status === 'Llevada a Reunión' ? 'bg-[#D95338]/15 text-[#C84B31]' : 'bg-[#EFEAE1] text-[#6E685F]'
                  }`}>
                    {idea.status}
                  </span>
                </div>

                <h3 className="font-display text-base font-extrabold text-[#1C1B1A] mb-2 leading-snug">{idea.title}</h3>
                <p className="text-xs text-[#524E48] leading-relaxed mb-4">{idea.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E6E0D4] text-xs">
                  
                  <button
                    onClick={() => toggleVoteIdea(idea.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-xs transition-all ${
                      hasVoted
                        ? 'bg-[#D95338]/15 text-[#C84B31] border border-[#D95338]/30 shadow-xs'
                        : 'bg-white text-[#6E685F] hover:text-[#1C1B1A] border border-[#E6E0D4]'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${hasVoted ? 'fill-[#D95338]' : ''}`} />
                    <span>{idea.votes.length} Interés</span>
                  </button>

                  <button
                    onClick={() => toggleComments(idea.id)}
                    className="flex items-center gap-1 text-[#6E685F] hover:text-[#D95338] font-semibold"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>({idea.comments?.length || 0})</span>
                    {isCommentsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {idea.status !== 'Llevada a Reunión' && (
                    <button
                      onClick={() => convertIdeaToTopic(idea.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#D95338]/10 hover:bg-[#D95338]/20 text-[#C84B31] rounded-xl font-bold text-[11px] border border-[#D95338]/25 transition-all"
                    >
                      <span>Llevar a Agenda</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {isCommentsOpen && (
                  <CommentSection
                    comments={idea.comments || []}
                    onAddComment={(text) => addIdeaComment(idea.id, text)}
                    placeholder="Escribe una opinión..."
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for New Idea */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E6E0D4] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-[#1C1B1A] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#D98A2B]" />
              <span>Proponer Idea de Negocio</span>
            </h3>

            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Título de la Idea *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Abrir vertical B2B en Latinoamérica"
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3 py-2 text-xs text-[#1C1B1A]"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6E685F] mb-1">Explicación de la Oportunidad</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="En qué consiste y por qué vale la pena discurtirla..."
                  className="w-full bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A]"
                />
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
                  className="px-5 py-2 bg-[#D98A2B] text-white font-extrabold text-xs rounded-xl shadow-lg"
                >
                  Publicar Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
