import React, { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { PixQrVisual } from './PixQrVisual';
import { generatePixCopiaECola } from '../utils/pix';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  receiver: string;
  description: string;
  onConfirmSuccess?: () => void;
}

export const PixModal: React.FC<PixModalProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  receiver,
  description,
  onConfirmSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const pixKey = 'financeiro@barbeariaelite.com.br';
  const pixCode = generatePixCopiaECola(
    '00987654321',
    receiver.slice(0, 20),
    'RIO DE JANEIRO',
    amount
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirmSuccess?.();
      onClose();
      setConfirmed(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
            <span>Pagamento Instantâneo Pix</span>
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-xs text-neutral-400 mt-1">{description}</p>
        </div>

        <div className="flex flex-col items-center justify-center mb-5">
          <PixQrVisual value={pixCode} size={180} label="PIX-PAY" />
          <div className="mt-3 text-center">
            <span className="text-xs text-neutral-400">Valor a pagar:</span>
            <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">
              R$ {amount.toFixed(2)}
            </div>
            <span className="text-xs text-neutral-400 mt-0.5 block">
              Beneficiário: <strong className="text-neutral-200">{receiver}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between gap-2">
            <div className="truncate text-xs font-mono text-neutral-300">
              {pixCode.slice(0, 36)}...
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copiar Código
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleConfirmPayment}
            disabled={confirmed}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
              confirmed
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {confirmed ? (
              <>
                <Check className="w-4 h-4 animate-bounce" /> Pagamento Reconhecido!
              </>
            ) : (
              'Já realizei o pagamento'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
