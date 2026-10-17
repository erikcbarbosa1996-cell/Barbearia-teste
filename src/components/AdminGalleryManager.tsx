import React, { useState } from 'react';
import {
  Camera,
  Check,
  X,
  Trash2,
  MessageCircle,
  Heart,
  Upload,
  Scissors,
  User,
  ShieldCheck,
  Plus,
  Eye,
  AlertCircle
} from 'lucide-react';
import { GalleryPost, Barber } from '../types';
import { compressImageFile } from '../utils/image';
import { GalleryPostModal } from './GalleryPostModal';

interface AdminGalleryManagerProps {
  posts: GalleryPost[];
  barbers: Barber[];
  onApprovePost: (postId: string) => void;
  onRejectPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onAddComment: (postId: string, comment: { authorName: string; text: string; isBarberReply?: boolean }) => void;
  onToggleLike: (postId: string) => void;
  onDirectPublish: (postData: {
    imageUrl: string;
    caption: string;
    authorName: string;
    barberName: string;
    isBarberPost: boolean;
  }) => void;
  shopName: string;
}

export const AdminGalleryManager: React.FC<AdminGalleryManagerProps> = ({
  posts,
  barbers,
  onApprovePost,
  onRejectPost,
  onDeletePost,
  onDeleteComment,
  onAddComment,
  onToggleLike,
  onDirectPublish,
  shopName
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'direct' | 'all'>('pending');
  const [inspectPostId, setInspectPostId] = useState<string | null>(null);

  // Formulário de publicação direta
  const [directImage, setDirectImage] = useState('');
  const [directCaption, setDirectCaption] = useState('');
  const [directBarber, setDirectBarber] = useState(barbers[0]?.name || 'Carlos Silva');
  const [directAuthor, setDirectAuthor] = useState(shopName);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const pendingPosts = posts.filter((p) => p.status === 'PENDING');
  const approvedPosts = posts.filter((p) => p.status === 'APPROVED');
  const inspectPost = posts.find((p) => p.id === inspectPostId) || null;

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.85);
        setDirectImage(compressed);
        setFeedbackMsg('Foto carregada com sucesso da sua galeria!');
        setTimeout(() => setFeedbackMsg(null), 3000);
      } catch (err) {
        setFeedbackMsg('Erro ao processar imagem.');
        setTimeout(() => setFeedbackMsg(null), 3000);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directImage) {
      setFeedbackMsg('Selecione uma imagem da sua galeria!');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    onDirectPublish({
      imageUrl: directImage,
      caption: directCaption.trim() || 'Transformação profissional executada com perfeição!',
      authorName: directAuthor.trim() || shopName,
      barberName: directBarber,
      isBarberPost: true
    });

    setDirectImage('');
    setDirectCaption('');
    setFeedbackMsg('Corte publicado no portfólio oficial!');
    setTimeout(() => setFeedbackMsg(null), 3500);
    setActiveTab('all');
  };

  return (
    <div className="bg-[#161F2E]/80 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            Gestão da Galeria, Moderação & Portfólio
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Aprove fotos enviadas pelos clientes, publique novos cortes no portfólio e modere comentários.
          </p>
        </div>

        {/* Sub-navegação da Galeria */}
        <div className="flex items-center gap-1.5 bg-[#0B0F17] p-1 rounded-2xl border border-white/10 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Moderação de Fotos</span>
            {pendingPosts.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingPosts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              activeTab === 'direct'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Postar Corte
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todas as Fotos ({approvedPosts.length})
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-semibold rounded-xl animate-in fade-in flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ABA 1: MODERAÇÃO DE FOTOS DE CLIENTES */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
              Fotos Aguardando Aprovação ({pendingPosts.length})
            </span>
            <span className="text-[11px] text-gray-400">
              Fotos aprovadas aparecem instantaneamente para os clientes no feed público.
            </span>
          </div>

          {pendingPosts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#0E1522] border border-white/5 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <h5 className="font-bold text-sm text-white">Nenhuma foto pendente no momento</h5>
              <p className="text-xs text-gray-400">
                Todas as fotos enviadas pelos clientes já foram moderadas ou aprovadas!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#0E1522] border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/5] bg-black/60 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded shadow">
                      Aguardando Moderação
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-white">
                          Cliente: {post.authorName}
                        </span>
                        <span className="text-[10px] text-gray-400">{post.createdAt}</span>
                      </div>
                      <span className="text-[11px] text-amber-400 font-semibold block mt-0.5">
                        Barbeiro: <strong>{post.barberName}</strong>
                      </span>
                    </div>

                    {post.caption && (
                      <p className="text-xs text-gray-300 italic bg-[#0B0F17] p-2 rounded-lg border border-white/5">
                        "{post.caption}"
                      </p>
                    )}

                    {/* Botões de Ação para Aprovar ou Recusar */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => onApprovePost(post.id)}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Aprovar
                      </button>

                      <button
                        onClick={() => onRejectPost(post.id)}
                        className="py-2 px-3 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-900/50 text-red-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" /> Recusar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: POSTAGEM DIRETA PELO BARBEIRO */}
      {activeTab === 'direct' && (
        <form onSubmit={handleDirectSubmit} className="p-4 sm:p-5 bg-[#0E1522] border border-white/10 rounded-2xl space-y-4">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
            + Publicar Novo Corte no Portfólio da Barbearia (Aprovação Automática)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upload de Imagem */}
            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1.5">
                Foto do Corte (Galeria do Celular / Computador) *
              </label>

              {directImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-black/60 max-h-60 flex items-center justify-center">
                  <img src={directImage} alt="Preview" className="w-full max-h-60 object-cover" />
                  <button
                    type="button"
                    onClick={() => setDirectImage('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-red-900 text-white border border-white/20 text-xs transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-500/30 hover:border-amber-500/60 rounded-2xl bg-[#0B0F17] hover:bg-[#121B2B] cursor-pointer transition-all active:scale-[0.99] group">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white text-center">
                    {isProcessing ? 'Comprimindo foto...' : 'Toque para escolher da Galeria'}
                  </span>
                  <span className="text-[11px] text-gray-400 text-center mt-1">
                    Upload rápido e direto da câmera ou galeria do aparelho
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDirectImageUpload}
                    onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
              )}
            </div>

            {/* Campos de texto */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Barbeiro Responsável pelo Corte *
                </label>
                <select
                  value={directBarber}
                  onChange={(e) => setDirectBarber(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.name}>
                      💈 {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Legenda / Detalhes do Corte *
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Fade degradê com acabamento razor sharp e barba alinhada com toalha quente."
                  value={directCaption}
                  onChange={(e) => setDirectCaption(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !directImage}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Publicar no Portfólio Oficial
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ABA 3: TODAS AS FOTOS & MODERAÇÃO DE COMENTÁRIOS */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
              Fotos Publicadas no Feed Público ({approvedPosts.length})
            </span>
            <span className="text-[11px] text-gray-400">
              Clique em qualquer foto para ver e gerenciar os comentários.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[#0E1522] border border-white/10 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
              >
                <div className="relative aspect-[4/5] bg-black/60 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1">
                    {post.isBarberPost ? (
                      <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded shadow">
                        Portfólio
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase bg-blue-600 text-white px-2 py-0.5 rounded shadow">
                        Cliente
                      </span>
                    )}
                  </div>

                  <span className="absolute bottom-2.5 right-2.5 text-[10px] bg-black/75 text-amber-300 font-bold px-2 py-0.5 rounded-lg border border-amber-500/30">
                    💈 {post.barberName}
                  </span>
                </div>

                <div className="p-3.5 space-y-2">
                  <p className="text-xs text-white line-clamp-2">
                    {post.caption}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.comments.length} comentários
                    </span>
                  </div>

                  {/* Ações de Moderação */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setInspectPostId(post.id)}
                      className="py-1.5 px-2.5 rounded-xl bg-[#161F2E] hover:bg-amber-500/20 text-amber-300 border border-white/10 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver / Moderar
                    </button>

                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="py-1.5 px-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 text-red-300 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      title="Excluir foto do portfólio"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir Foto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Ver Foto Ampliada e Moderar Comentários */}
      <GalleryPostModal
        post={inspectPost}
        isOpen={Boolean(inspectPostId)}
        onClose={() => setInspectPostId(null)}
        onToggleLike={onToggleLike}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        isAdmin={true}
        shopName={shopName}
      />
    </div>
  );
};
