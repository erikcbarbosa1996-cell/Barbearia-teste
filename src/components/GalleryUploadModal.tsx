import React, { useState } from 'react';
import { X, Upload, Camera, Scissors, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { Barber } from '../types';
import { compressImageFile } from '../utils/image';

interface GalleryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbers: Barber[];
  onUploadPost: (postData: {
    imageUrl: string;
    caption: string;
    authorName: string;
    barberName: string;
    isBarberPost: boolean;
  }) => void;
  isAdmin?: boolean;
  shopName?: string;
}

export const GalleryUploadModal: React.FC<GalleryUploadModalProps> = ({
  isOpen,
  onClose,
  barbers,
  onUploadPost,
  isAdmin = false,
  shopName = 'Barbearia Imperial Elite'
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [authorName, setAuthorName] = useState(isAdmin ? shopName : '');
  const [barberName, setBarberName] = useState(barbers[0]?.name || 'Carlos Silva');
  const [caption, setCaption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setErrorMsg(null);
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.85);
        setImageUrl(compressed);
      } catch (err) {
        setErrorMsg('Erro ao processar imagem da galeria. Tente outra foto.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setErrorMsg('Por favor, selecione uma foto da galeria do seu aparelho!');
      return;
    }

    onUploadPost({
      imageUrl,
      caption: caption.trim() || 'Transformação no padrão mais alto da Barbearia!',
      authorName: authorName.trim() || (isAdmin ? shopName : 'Cliente Satisfeito'),
      barberName,
      isBarberPost: isAdmin
    });

    setImageUrl('');
    setCaption('');
    if (!isAdmin) setAuthorName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0E1522] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-white/10 pb-3 mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
            {isAdmin ? 'Publicação Direta' : 'Envio para a Comunidade'}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            {isAdmin ? 'Postar Foto no Portfólio' : 'Enviar Foto do seu Corte'}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {isAdmin
              ? 'A foto será publicada instantaneamente no feed da galeria.'
              : 'Sua foto entrará para moderação da equipe antes de ser exibida no feed público.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-900/50 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de Foto da Galeria */}
          <div>
            <label className="block text-xs font-bold text-amber-400 mb-1.5">
              1. Foto do Corte (Galeria do Celular / Computador) *
            </label>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-black/50 max-h-56 flex items-center justify-center">
                <img src={imageUrl} alt="Preview" className="w-full max-h-56 object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-red-900 text-white border border-white/20 text-xs transition-colors"
                  title="Remover e escolher outra foto"
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
                  {isProcessing ? 'Processando imagem...' : 'Toque para escolher da Galeria'}
                </span>
                <span className="text-[11px] text-gray-400 text-center mt-1">
                  Formatos aceitos: JPG, PNG, WEBP (fotos do celular)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
            )}
          </div>

          {/* Nome do Autor e Barbeiro Responsável */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                2. Seu Nome {isAdmin ? '(Barbearia)' : '(Cliente)'} *
              </label>
              <input
                type="text"
                placeholder={isAdmin ? shopName : 'Ex: Lucas Ferreira'}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                3. Barbeiro Responsável *
              </label>
              <select
                value={barberName}
                onChange={(e) => setBarberName(e.target.value)}
                className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {barbers.map((b) => (
                  <option key={b.id} value={b.name}>
                    💈 {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Legenda / Detalhes */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              4. Legenda / O que achou do corte? (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Degradê navalhado impecável e barba alinhada na toalha quente!"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || !imageUrl}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isAdmin ? 'Publicar no Portfólio' : 'Enviar para Moderação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
