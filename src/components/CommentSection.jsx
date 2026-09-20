import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send } from 'lucide-react';

export const CommentSection = ({ comments = [], onAddComment, placeholder = 'Escribe un comentario o nota...' }) => {
  const [text, setText] = useState('');
  const { currentUser, partners } = useApp();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text);
    setText('');
  };

  return (
    <div className="mt-4 pt-3 border-t border-[#E6E0D4]">
      <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#6E685F]">
        <MessageSquare className="w-3.5 h-3.5 text-[#D95338]" />
        <span>Hilos de Discusión ({comments.length})</span>
      </div>

      <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-[#8A847A] italic">No hay comentarios aún. Deja una nota o actualización para tu socio.</p>
        ) : (
          comments.map(c => {
            const authorPartner = partners.find(p => p.id === c.authorId);
            const isMe = c.authorId === currentUser.id;
            return (
              <div 
                key={c.id} 
                className={`p-2.5 rounded-xl text-xs ${
                  isMe 
                    ? 'bg-[#D95338]/10 border border-[#D95338]/20 ml-3' 
                    : 'bg-[#F5F2EB] border border-[#E6E0D4] mr-3'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1C1B1A]">
                    <span>{authorPartner?.avatar || '👤'}</span>
                    <span className={isMe ? 'text-[#C84B31]' : 'text-[#1C1B1A]'}>
                      {c.authorName} {isMe && '(Tú)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8A847A] font-mono">{c.timestamp}</span>
                </div>
                <p className="text-[#3A3733] whitespace-pre-wrap leading-relaxed">{c.text}</p>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-[#F5F2EB] border border-[#E6E0D4] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A] placeholder-[#8A847A] focus:outline-none focus:border-[#D95338]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-3.5 py-2 bg-[#D95338] hover:bg-[#C84B31] disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </button>
      </form>
    </div>
  );
};
