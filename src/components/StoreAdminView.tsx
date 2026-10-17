import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  Scissors,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Volume2,
  Settings,
  Clock,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { Barber, Service, Appointment } from '../types';
import { getWhatsAppBookingLink } from '../utils/pix';
import { playNotificationSound } from '../utils/audio';
import { compressImageFile, getInitials } from '../utils/image';

interface StoreAdminViewProps {
  shopName: string;
  setShopName: (name: string) => void;
  bannerText: string;
  setBannerText: (text: string) => void;
  barbers: Barber[];
  setBarbers: React.Dispatch<React.SetStateAction<Barber[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  currentMonthlyFee: number;
}

export const StoreAdminView: React.FC<StoreAdminViewProps> = ({
  shopName,
  setShopName,
  bannerText,
  setBannerText,
  barbers,
  setBarbers,
  services,
  setServices,
  appointments,
  setAppointments,
  currentMonthlyFee,
}) => {
  // New barber state
  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberCommission, setNewBarberCommission] = useState('');
  const [newBarberAvatar, setNewBarberAvatar] = useState('');
  const [barberError, setBarberError] = useState<string | null>(null);
  const [barberSuccess, setBarberSuccess] = useState<string | null>(null);

  // New service state
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(45);
  const [newServiceDuration, setNewServiceDuration] = useState(30);

  // Filter state for appointments
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELED'>('ALL');
  const [barberFilter, setBarberFilter] = useState<string>('ALL');

  // Stats
  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const totalCompletedRevenue = appointments
    .filter((a) => a.status === 'COMPLETED')
    .reduce((acc, a) => acc + a.price, 0);

  const monthlyRevenue = 4850 + totalCompletedRevenue;
  const todayCuts = scheduledCount + completedCount;

  // Barber photo upload from device gallery
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 400, 400, 0.85);
        setNewBarberAvatar(compressed);
        setBarberSuccess('Foto carregada com sucesso da sua galeria!');
        setTimeout(() => setBarberSuccess(null), 3000);
      } catch (err) {
        setBarberError('Erro ao carregar imagem da galeria.');
        setTimeout(() => setBarberError(null), 3000);
      }
    }
  };

  const handleExistingBarberPhoto = async (id: string, file: File) => {
    try {
      const compressed = await compressImageFile(file, 400, 400, 0.85);
      setBarbers((prev) => prev.map((b) => (b.id === id ? { ...b, avatar: compressed } : b)));
      setBarberSuccess('Foto do barbeiro atualizada pela galeria!');
      setTimeout(() => setBarberSuccess(null), 3000);
    } catch (err) {
      setBarberError('Erro ao processar imagem.');
      setTimeout(() => setBarberError(null), 3000);
    }
  };

  // Barber management
  const handleAddBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;

    const commissionNum = newBarberCommission.trim() !== '' ? Number(newBarberCommission) : undefined;

    const newBarber: Barber = {
      id: Date.now().toString(),
      name: newBarberName.trim(),
      commission: commissionNum,
      avatar: newBarberAvatar || undefined,
    };

    setBarbers([...barbers, newBarber]);
    setNewBarberName('');
    setNewBarberCommission('');
    setNewBarberAvatar('');
    setBarberError(null);
    setBarberSuccess(`Profissional ${newBarber.name} adicionado!`);
    setTimeout(() => setBarberSuccess(null), 3000);
  };

  const handleRemoveBarber = (id: string) => {
    const removed = barbers.find((b) => b.id === id);
    setBarbers(barbers.filter((b) => b.id !== id));
    setBarberSuccess(`Barbeiro ${removed?.name || ''} excluído com sucesso!`);
    setTimeout(() => setBarberSuccess(null), 3000);
  };

  // Service management
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const newService: Service = {
      id: `s_${Date.now()}`,
      name: newServiceName.trim(),
      price: Number(newServicePrice) || 30,
      durationMinutes: Number(newServiceDuration) || 30,
    };

    setServices([...services, newService]);
    setNewServiceName('');
    setShowAddService(false);
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  // Appointment actions
  const handleStatusChange = (id: string, newStatus: 'SCHEDULED' | 'COMPLETED' | 'CANCELED') => {
    setAppointments(
      appointments.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  // Filtered list
  const filteredAppointments = appointments.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesBarber = barberFilter === 'ALL' || item.barberName === barberFilter;
    return matchesStatus && matchesBarber;
  });

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Indicadores em Grid Responsivo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-gray-900 border border-gray-800 p-3.5 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold">Cortes Hoje</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h4 className="text-xl sm:text-3xl font-black text-blue-400 tabular-nums">{todayCuts}</h4>
            <span className="text-[10px] text-gray-500">({scheduledCount} fila)</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-3.5 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold">Faturamento Mês</p>
          <h4 className="text-xl sm:text-3xl font-black mt-1 text-emerald-400 tabular-nums">
            R$ {monthlyRevenue.toLocaleString('pt-BR')}
          </h4>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-3.5 sm:p-4 rounded-2xl">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold">Equipe Ativa</p>
          <h4 className="text-xl sm:text-3xl font-black mt-1 text-purple-400 tabular-nums">
            {barbers.length} <span className="text-xs font-normal text-gray-400">barbeiros</span>
          </h4>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold">Aviso Sonoro</p>
          <button
            onClick={() => playNotificationSound()}
            className="mt-1 w-full py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-blue-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors min-h-[36px]"
          >
            <Volume2 className="w-3.5 h-3.5" /> Testar Som
          </button>
        </div>
      </div>

      {/* Gerenciador da Equipe & Regra de Cobrança */}
      <div className="bg-gray-900 border border-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray-800 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Equipe de Barbeiros
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
              Mensalidade SaaS ajustada automaticamente: <strong className="text-white">R$ {currentMonthlyFee},00/mês</strong>
            </p>
          </div>
        </div>

        {barberSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-900/50 rounded-xl text-xs text-emerald-300 font-semibold animate-in fade-in">
            {barberSuccess}
          </div>
        )}

        {barberError && (
          <div className="p-3 bg-red-950/60 border border-red-900/50 rounded-xl text-xs text-red-300">
            {barberError}
          </div>
        )}

        {/* Formulário Novo Barbeiro */}
        <form onSubmit={handleAddBarber} className="space-y-3 p-3.5 bg-gray-950 rounded-2xl border border-gray-800/80">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            + Cadastrar Novo Barbeiro na Equipe
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Nome do Profissional *
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Silva"
                value={newBarberName}
                onChange={(e) => setNewBarberName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 mb-1">
                Comissão % <span className="text-gray-500 font-normal">(Opcional)</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Ex: 50 (opcional)"
                value={newBarberCommission}
                onChange={(e) => setNewBarberCommission(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Upload de Foto da Galeria do Dispositivo */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">
              Foto do Barbeiro (Galeria do Celular / Aparelho)
            </label>
            <div className="flex items-center gap-3 p-2 bg-gray-900 rounded-xl border border-gray-800">
              {newBarberAvatar ? (
                <div className="relative">
                  <img
                    src={newBarberAvatar}
                    alt="Preview"
                    className="w-11 h-11 rounded-full object-cover border-2 border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setNewBarberAvatar('')}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                    title="Remover foto"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-400 shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-blue-400 font-bold text-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{newBarberAvatar ? 'Trocar Foto da Galeria' : 'Escolher Foto da Galeria'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                  {newBarberAvatar ? 'Foto pronta para salvar' : 'Selecione da galeria de fotos do seu celular'}
                </p>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shrink-0"
              >
                Salvar Barbeiro
              </button>
            </div>
          </div>
        </form>

        {/* Lista de Barbeiros da Equipe */}
        <div className="space-y-2 mt-3">
          {barbers.length === 0 ? (
            <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 text-center text-xs text-gray-400">
              Nenhum profissional cadastrado. Adicione seus barbeiros no formulário acima.
            </div>
          ) : (
            barbers.map((barber) => (
              <div
                key={barber.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gray-950 p-3 rounded-xl border border-gray-800/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {barber.avatar ? (
                    <img
                      src={barber.avatar}
                      alt={barber.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-blue-500/50 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-950/60 border-2 border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {getInitials(barber.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-white truncate">{barber.name}</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {barber.commission !== undefined && barber.commission > 0
                        ? `Comissão: ${barber.commission}%`
                        : 'Sem comissão definida'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] bg-gray-900 hover:bg-gray-800 text-blue-400 border border-gray-800 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Mudar Foto (Galeria)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleExistingBarberPhoto(barber.id, file);
                      }}
                      onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handleRemoveBarber(barber.id)}
                    className="text-xs bg-red-950/60 text-red-400 border border-red-900/40 px-3 py-1.5 rounded-lg hover:bg-red-900/60 transition-colors flex items-center gap-1"
                    title="Excluir este barbeiro"
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Agendamentos do Dia */}
      <div className="bg-gray-900 border border-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Agendamentos do Dia
          </h3>

          {/* Filtros Mobile Compactos */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 p-1 bg-gray-950 rounded-xl border border-gray-800 text-[11px]">
              {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' && 'Todos'}
                  {st === 'SCHEDULED' && 'Fila'}
                  {st === 'COMPLETED' && 'Feitos'}
                  {st === 'CANCELED' && 'Cancelados'}
                </button>
              ))}
            </div>

            <select
              value={barberFilter}
              onChange={(e) => setBarberFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-xl px-2.5 py-1.5 text-[11px] text-gray-300 focus:outline-none"
            >
              <option value="ALL">Todos Barbeiros</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            Nenhum agendamento encontrado para este filtro.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAppointments.map((item) => {
              const isScheduled = item.status === 'SCHEDULED';
              const isCompleted = item.status === 'COMPLETED';
              const isCanceled = item.status === 'CANCELED';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCompleted
                      ? 'bg-gray-950/40 border-gray-800/60 opacity-80'
                      : isCanceled
                      ? 'bg-gray-950/30 border-red-950/40 opacity-60'
                      : 'bg-gray-950 border-gray-800 shadow-md'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs sm:text-sm text-white">
                        {item.clientName}
                      </p>
                      <span className="text-[10px] text-gray-400 font-mono">
                        ({item.clientPhone})
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-bold">• Concluído</span>
                      )}
                      {isCanceled && (
                        <span className="text-[10px] text-red-400 font-bold">• Cancelado</span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-blue-400">
                      {item.serviceName} com <strong className="text-gray-200">{item.barberName}</strong> às <strong className="text-white">{item.time}</strong>
                    </p>
                    {item.notes && (
                      <p className="text-[10px] text-gray-500 italic">Obs: "{item.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-0 border-gray-800/60 pt-2 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full text-gray-300">
                        {item.paymentMethod}
                      </span>
                      <span className="text-xs font-bold text-emerald-400 tabular-nums">
                        R$ {item.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={getWhatsAppBookingLink(
                          item.clientPhone,
                          shopName,
                          item.serviceName,
                          item.barberName,
                          item.time,
                          item.price
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-emerald-400 transition-colors min-h-[38px] flex items-center justify-center"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {isScheduled && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-1 min-h-[38px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, 'CANCELED')}
                            className="px-2.5 py-1.5 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-xs font-semibold flex items-center gap-1 min-h-[38px]"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        </>
                      )}

                      {(isCompleted || isCanceled) && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'SCHEDULED')}
                          className="px-2.5 py-1.5 rounded-xl bg-gray-800 text-gray-300 text-xs font-medium min-h-[38px]"
                        >
                          Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Serviços & Configurações da Barbearia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Serviços */}
        <div className="bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <Scissors className="w-3.5 h-3.5 text-blue-400" />
              Serviços & Preços
            </h4>
            <button
              onClick={() => setShowAddService(!showAddService)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-blue-400 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Novo
            </button>
          </div>

          {showAddService && (
            <form onSubmit={handleAddService} className="p-3.5 bg-gray-950 rounded-xl border border-gray-800 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">
                  Nome do Serviço (ex: Corte Degradê, Barboterapia)
                </label>
                <input
                  type="text"
                  placeholder="Nome do Serviço"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Preço do Serviço (R$)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 45"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-300 mb-1">
                    Duração Estimada (Minutos)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    placeholder="Ex: 30"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddService(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1.5">
            {services.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2.5 bg-gray-950 rounded-xl border border-gray-800/60"
              >
                <div>
                  <p className="font-semibold text-xs text-white">{s.name}</p>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.durationMinutes} min
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xs sm:text-sm text-emerald-400 tabular-nums">
                    R$ {s.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteService(s.id)}
                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                    title="Excluir serviço"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
          <div className="border-b border-gray-800 pb-2.5">
            <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              Configurações da Loja
            </h4>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Nome da Barbearia
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Banner Promocional
              </label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
