import React, { useState } from 'react';
import {
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Users,
  TrendingDown,
  Info
} from 'lucide-react';
import { PixQrVisual } from './PixQrVisual';
import { generatePixCopiaECola } from '../utils/pix';

interface SaasSubscriptionViewProps {
  barbersCount: number;
  currentMonthlyFee: number;
  calculateMonthlyFee: (count: number) => number;
  shopName: string;
}

export const SaasSubscriptionView: React.FC<SaasSubscriptionViewProps> = ({
  barbersCount,
  currentMonthlyFee,
  calculateMonthlyFee,
  shopName,
}) => {
  const [copied, setCopied] = useState(false);
  const [simulatedBarbers, setSimulatedBarbers] = useState(barbersCount);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const pixPayload = generatePixCopiaECola(
    'saas-billing@barbeariasaas.com',
    'PLATAFORMA SAAS BARBER',
    'SAO PAULO',
    currentMonthlyFee,
    'MENSALIDADE'
  );

  const handleCopyPix = () => {
    navigator.clipboard?.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const simulatedFee = calculateMonthlyFee(simulatedBarbers);
  const averagePerBarber = (simulatedFee / simulatedBarbers).toFixed(2);

  const tierSimulation = [1, 2, 3, 4, 5, 6, 8, 10].map((count) => ({
    count,
    total: calculateMonthlyFee(count),
    perBarber: (calculateMonthlyFee(count) / count).toFixed(2),
  }));

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Card Principal da Assinatura */}
      <div className="bg-gray-900 border border-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Plano & Mensalidade SaaS</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Cobrança progressiva baseada na quantidade de barbeiros na barbearia.
            </p>
          </div>
          <span className="self-start sm:self-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            15 Dias Grátis Ativos
          </span>
        </div>

        {/* Resumo do Plano & Box Pix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch bg-gray-950 p-4 sm:p-6 rounded-2xl border border-gray-800">
          <div className="space-y-2.5 sm:space-y-3 flex flex-col justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                Resumo da Loja: {shopName}
              </p>
              <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-gray-800/80">
                <span className="text-gray-400">Barbeiros ativos:</span>
                <strong className="text-white font-semibold">
                  {barbersCount} {barbersCount === 1 ? 'profissional' : 'profissionais'}
                </strong>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-gray-800/80">
                <span className="text-gray-400">Valor base (1º barbeiro):</span>
                <span className="text-gray-200 tabular-nums">R$ 100,00</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-gray-800/80">
                <span className="text-gray-400">
                  Adicionais ({Math.max(0, barbersCount - 1)}x):
                </span>
                <span className="text-gray-200 tabular-nums">
                  R$ {Math.max(0, currentMonthlyFee - 100)},00
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-gray-800/80">
                <span className="text-gray-400">Custo médio por cadeira:</span>
                <span className="text-emerald-400 tabular-nums font-semibold">
                  R$ {(currentMonthlyFee / barbersCount).toFixed(2)}/mês
                </span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-3 flex justify-between items-baseline">
              <span className="text-xs sm:text-sm font-semibold text-gray-300">
                Mensalidade Total:
              </span>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">
                  R$ {currentMonthlyFee},00
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 block">/ mês</span>
              </div>
            </div>
          </div>

          {/* QR Code Pix */}
          <div className="flex flex-col items-center justify-center bg-gray-900 p-4 sm:p-5 rounded-xl border border-gray-800 text-center space-y-3">
            <div className="inline-flex items-center gap-1 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pagamento Instantâneo Pix</span>
            </div>

            <div className="my-1">
              <PixQrVisual value={pixPayload} size={140} label="SAAS" />
            </div>

            <p className="text-[11px] sm:text-xs text-gray-400">
              Escaneie com o app do seu banco para pagar R$ {currentMonthlyFee},00 via Pix
            </p>

            <button
              onClick={handleCopyPix}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Pix Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copiar Pix Copia e Cola
                </>
              )}
            </button>

            <button
              onClick={() => {
                setPaymentSuccess(true);
                setTimeout(() => setPaymentSuccess(false), 3500);
              }}
              className="w-full py-2 rounded-xl text-[11px] font-semibold text-gray-400 hover:text-white bg-gray-950 border border-gray-800 transition-colors"
            >
              {paymentSuccess ? '✅ Mensalidade Confirmada!' : 'Simular Confirmação de Pagamento'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulador Interativo */}
      <div className="bg-gray-900 border border-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
        <div className="border-b border-gray-800 pb-3">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <TrendingDown className="w-4 h-4" />
            <span>Escala com Economia por Cadeira</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white mt-1">
            Simulador de Crescimento
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Ao expandir a equipe, o valor por barbeiro cai progressivamente.
          </p>
        </div>

        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm font-bold text-white">
                {simulatedBarbers} {simulatedBarbers === 1 ? 'Barbeiro' : 'Barbeiros'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-emerald-400 tabular-nums">
                R$ {simulatedFee},00
              </span>
              <span className="text-[10px] text-gray-400 block">
                (R$ {averagePerBarber} / profissional)
              </span>
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="12"
            value={simulatedBarbers}
            onChange={(e) => setSimulatedBarbers(Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-2 bg-gray-800 rounded-lg appearance-none"
          />
        </div>

        {/* Tabela de Preços com rolagem horizontal suave */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse text-xs min-w-[320px]">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Equipe</th>
                <th className="py-2.5 px-3 text-right">Mensalidade</th>
                <th className="py-2.5 px-3 text-right">Por Cadeira</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {tierSimulation.slice(0, 6).map((t) => {
                const isCurrent = t.count === barbersCount;
                return (
                  <tr
                    key={t.count}
                    className={isCurrent ? 'bg-purple-950/30 text-white font-bold' : ''}
                  >
                    <td className="py-2.5 px-3">
                      {t.count} {t.count === 1 ? 'barbeiro' : 'barbeiros'}
                      {isCurrent && (
                        <span className="ml-2 text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                          Atual
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                      R$ {t.total},00
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gray-300">
                      R$ {t.perBarber}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
