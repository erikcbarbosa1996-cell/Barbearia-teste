import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Trash2,
  CheckCircle2,
  Calendar,
  User,
  Scissors,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { GalleryPost, GalleryComment } from '../types';

interface GalleryPostModalProps {
  post: GalleryPost | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, comment: Omit<GalleryComment, 'id' | 'createdAt'>) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  isAdmin?: boolean;
  shopName?: string;
}

export const GalleryPostModal: React.FC<GalleryPostModalProps> = ({
  post,
  isOpen,
  onClose,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  isAdmin = false,
  shopName = 'Barbearia Imperial Elite'
}) => {
  const [commentAuthor, setCommentAuthor] = useState(isAdmin ? shopName : '');
  const [commentText, setCommentText] = useState('');
  const [asBarberReply, setAsBarberReply] = useState(isAdmin);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !post) return null;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const author = commentAuthor.trim() || (asBarberReply ? shopName : 'Cliente VIP');

    onAddComment(post.id, {
      authorName: author,
      text: commentText.trim(),
      isBarberReply: asBarberReply
    });

    setCommentText('');
    if (!isAdmin) {
      setCommentAuthor('');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0E1522] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-90"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lado Esquerdo: Imagem Ampliada */}
        <div className="relative w-full md:w-3/5 bg-black/70 flex items-center justify-center overflow-hidden min-h-[260px] md:min-h-[500px]">
          <img
            src={post.imageUrl}
            alt={post.caption}
            className="w-full h-full max-h-[60vh] md:max-h-[85vh] object-contain select-none"
          />

          {/* Badge de status ou tipo */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {post.isBarberPost ? (
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Scissors className="w-3 h-3 stroke-[2.5]" /> Portfólio Oficial
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <User className="w-3 h-3 stroke-[2.5]" /> Corte do Cliente
              </span>
            )}
          </div>
        </div>

        {/* Lado Direito: Detalhes, Curtidas e Comentários */}
        <div className="w-full md:w-2/5 flex flex-col justify-between bg-[#0E1522] p-4 sm:p-5 border-t md:border-t-0 md:border-l border-white/10 overflow-hidden">
          {/* Cabeçalho do Post */}
          <div className="border-b border-white/10 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base text-white truncate">
                  {post.authorName}
                </h4>
                <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
                  <Scissors className="w-3 h-3 shrink-0" />
                  Feito por <strong>{post.barberName}</strong>
                </p>
              </div>

              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
                title="Compartilhar foto"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {copiedLink && (
              <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                ✓ Link copiado para a área de transferência!
              </span>
            )}

            {/* Legenda do Post */}
            {post.caption && (
              <p className="text-xs text-gray-300 mt-2 bg-[#0B0F17] p-2.5 rounded-xl border border-white/5 leading-relaxed">
                "{post.caption}"
              </p>
            )}

            {/* Linha de Interações (Curtir & Contador) */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleLike(post.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90 ${
                    post.likedByMe
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform ${
                      post.likedByMe ? 'fill-rose-500 text-rose-500 scale-110' : ''
                    }`}
                  />
                  <span>{post.likes}</span>
                </button>

                <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                  <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                  {post.comments.length} {post.comments.length === 1 ? 'comentário' : 'comentários'}
                </span>
              </div>

              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {post.createdAt}
              </span>
            </div>
          </div>

          {/* Lista de Comentários com Rolagem Suave */}
          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 max-h-[35vh] md:max-h-[42vh]">
            {post.comments.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                <MessageCircle className="w-8 h-8 text-gray-600 mx-auto mb-1.5 opacity-60" />
                Nenhum comentário ainda. Seja o primeiro a elogiar o corte!
              </div>
            ) : (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-2.5 rounded-xl text-xs space-y-1 relative group transition-colors ${
                    comment.isBarberReply
                      ? 'bg-amber-950/30 border border-amber-500/40 text-amber-100'
                      : 'bg-[#0B0F17] border border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-white text-[11px]">
                        {comment.authorName}
                      </span>
                      {comment.isBarberReply && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black px-1.5 py-0.5 rounded shadow-sm">
                          💈 Resposta da Barbearia
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-500">{comment.createdAt}</span>
                      {isAdmin && onDeleteComment && (
                        <button
                          onClick={() => onDeleteComment(post.id, comment.id)}
                          className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                          title="Excluir este comentário (Moderação)"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed break-words text-gray-200">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Formulário para Adicionar Comentário */}
          <form onSubmit={handleSubmitComment} className="border-t border-white/10 pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isAdmin ? `Seu Nome (${shopName})` : 'Seu Nome (Opcional)'}
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-1/2 bg-[#0B0F17] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />

              {isAdmin && (
                <label className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={asBarberReply}
                    onChange={(e) => setAsBarberReply(e.target.checked)}
                    className="rounded accent-amber-500"
                  />
                  <span>Tag Oficial</span>
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Escreva um comentário sobre o corte..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-[#0B0F17] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                required
              />
              <button
                type="submit"
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-md"
                title="Publicar comentário"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
