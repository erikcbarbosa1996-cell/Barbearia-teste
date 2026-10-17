import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Camera,
  Scissors,
  User,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { GalleryPost, Barber } from '../types';
import { GalleryPostModal } from './GalleryPostModal';
import { GalleryUploadModal } from './GalleryUploadModal';

interface GalleryFeedViewProps {
  posts: GalleryPost[];
  barbers: Barber[];
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, comment: { authorName: string; text: string; isBarberReply?: boolean }) => void;
  onDeleteComment?: (postId: string, commentId: string) => void;
  onUploadPost: (postData: {
    imageUrl: string;
    caption: string;
    authorName: string;
    barberName: string;
    isBarberPost: boolean;
  }) => void;
  isAdmin?: boolean;
  shopName?: string;
  onOpenBookingTab?: () => void;
}

export const GalleryFeedView: React.FC<GalleryFeedViewProps> = ({
  posts,
  barbers,
  onToggleLike,
  onAddComment,
  onDeleteComment,
  onUploadPost,
  isAdmin = false,
  shopName = 'Barbearia Imperial Elite',
  onOpenBookingTab
}) => {
  const [selectedBarberFilter, setSelectedBarberFilter] = useState<string>('ALL');
  const [activeModalPostId, setActiveModalPostId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Filter only approved posts for client view
  const approvedPosts = posts.filter((p) => p.status === 'APPROVED');

  const filteredPosts = approvedPosts.filter((p) => {
    if (selectedBarberFilter === 'ALL') return true;
    return p.barberName === selectedBarberFilter;
  });

  const activePost = posts.find((p) => p.id === activeModalPostId) || null;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Banner / Cabeçalho da Galeria */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#161F2E] via-[#0E1522] to-[#121A27] p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Comunidade & Inspirações
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Galeria de Cortes & Transformações
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Veja resultados reais feitos pelos nossos barbeiros. Curta seus favoritos, comente e envie a foto do seu corte!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>{isAdmin ? '+ Postar no Portfólio' : '📸 Enviar Meu Corte'}</span>
            </button>

            {onOpenBookingTab && (
              <button
                onClick={onOpenBookingTab}
                className="px-4 py-3 rounded-2xl bg-[#0B0F17] hover:bg-white/10 border border-white/15 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>Agendar Horário</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros por Barbeiro */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedBarberFilter('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[38px] ${
            selectedBarberFilter === 'ALL'
              ? 'bg-amber-500 text-black shadow-md font-black'
              : 'bg-[#161F2E]/80 border border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          Todos os Cortes ({approvedPosts.length})
        </button>

        {barbers.map((b) => {
          const count = approvedPosts.filter((p) => p.barberName === b.name).length;
          const isSelected = selectedBarberFilter === b.name;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBarberFilter(b.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[38px] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-black shadow-md font-black'
                  : 'bg-[#161F2E]/80 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span>💈 {b.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grade Mosaico da Galeria */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#161F2E]/60 border border-white/10 space-y-3">
          <Camera className="w-12 h-12 text-amber-400/60 mx-auto" />
          <h4 className="font-extrabold text-base text-white">Nenhum corte encontrado</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {selectedBarberFilter === 'ALL'
              ? 'Ainda não há fotos publicadas no feed. Seja o primeiro a compartilhar seu corte!'
              : `Ainda não há fotos atribuídas ao barbeiro ${selectedBarberFilter}.`}
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" /> Enviar primeira foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group bg-[#161F2E]/80 border border-white/10 hover:border-amber-500/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Imagem do Corte com Click para Abrir Modal */}
              <div
                onClick={() => setActiveModalPostId(post.id)}
                className="relative aspect-[4/5] w-full overflow-hidden bg-black/60 cursor-pointer select-none"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1522] via-transparent to-black/30 opacity-70 group-hover:opacity-50 transition-opacity" />

                {/* Badge de Oficial / Cliente */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {post.isBarberPost ? (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Scissors className="w-2.5 h-2.5 stroke-[3]" /> Oficial
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-600/90 text-white px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <User className="w-2.5 h-2.5" /> Cliente
                    </span>
                  )}
                </div>

                {/* Barbeiro Responsável Tag */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-black/75 px-2.5 py-1 rounded-xl backdrop-blur-md border border-amber-500/30">
                    <Scissors className="w-3 h-3 text-amber-400" />
                    {post.barberName}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-300 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    {post.createdAt}
                  </span>
                </div>
              </div>

              {/* Informações & Ações do Card */}
              <div className="p-3.5 sm:p-4 space-y-2.5">
                <div>
                  <span className="text-xs font-extrabold text-white block truncate">
                    {post.authorName}
                  </span>
                  <p className="text-[11px] text-gray-300 line-clamp-2 mt-0.5">
                    {post.caption}
                  </p>
                </div>

                {/* Barra de Interações (Curtir, Comentar e Ver Detalhes) */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Botão de Curtir */}
                    <button
                      onClick={() => onToggleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-90 ${
                        post.likedByMe
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                      }`}
                      title={post.likedByMe ? 'Descurtir' : 'Curtir corte'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform ${
                          post.likedByMe ? 'fill-rose-500 text-rose-500 scale-110' : ''
                        }`}
                      />
                      <span>{post.likes}</span>
                    </button>

                    {/* Botão de Comentários */}
                    <button
                      onClick={() => setActiveModalPostId(post.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
                      title="Ver comentários e detalhes"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Botão Ver Foto / Comentar */}
                  <button
                    onClick={() => setActiveModalPostId(post.id)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Ver detalhes →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <GalleryPostModal
        post={activePost}
        isOpen={Boolean(activeModalPostId)}
        onClose={() => setActiveModalPostId(null)}
        onToggleLike={onToggleLike}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        isAdmin={isAdmin}
        shopName={shopName}
      />

      <GalleryUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        barbers={barbers}
        onUploadPost={onUploadPost}
        isAdmin={isAdmin}
        shopName={shopName}
      />
    </div>
  );
};
