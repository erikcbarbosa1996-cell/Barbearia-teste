import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  QrCode,
  FileText
} from 'lucide-react';
import { Barber, Service, Appointment, PaymentMethod } from '../types';
import { formatPhoneNumber, getWhatsAppBookingLink } from '../utils/pix';
import { playNotificationSound } from '../utils/audio';
import { PixModal } from './PixModal';

interface ClientBookingViewProps {
  shopName: string;
  bannerText: string;
  barbers: Barber[];
  services: Service[];
  appointments: Appointment[];
  onAddAppointment: (appointment: Appointment) => void;
}

const AVAILABLE_TIMES = [
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:30',
  '17:30',
  '18:30',
  '19:30'
];

export const ClientBookingView: React.FC<ClientBookingViewProps> = ({
  shopName,
  bannerText,
  barbers,
  services,
  appointments,
  onAddAppointment,
}) => {
  const [selectedBarber, setSelectedBarber] = useState(barbers[0]?.name || '');
  const [selectedService, setSelectedService] = useState<Service>(services[0] || {
    id: 's1',
    name: 'Corte Degradê',
    price: 40,
    durationMinutes: 30
  });
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('Hoje');
  const [selectedTime, setSelectedTime] = useState('15:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix Online');
  const [clientNotes, setClientNotes] = useState('');

  // Confirmation state
  const [showPixModal, setShowPixModal] = useState(false);
  const [latestAppointment, setLatestAppointment] = useState<Appointment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientPhone(formatPhoneNumber(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || clientPhone.length < 10) {
      setToastMessage('Por favor, informe seu nome e WhatsApp válido!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      barberName: selectedBarber || barbers[0]?.name || 'Carlos Silva',
      serviceName: selectedService.name,
      price: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      paymentMethod,
      status: 'SCHEDULED',
      notes: clientNotes.trim() || undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddAppointment(newAppointment);
    setLatestAppointment(newAppointment);

    // Audio confirmation
    playNotificationSound();

    if (paymentMethod === 'Pix Online') {
      setShowPixModal(true);
    } else {
      setToastMessage(`Agendamento confirmado para as ${selectedTime}!`);
      setTimeout(() => setToastMessage(null), 4000);
    }

    setClientName('');
    setClientPhone('');
    setClientNotes('');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Banner / Hero Card Mobile-Friendly */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-800 shadow-xl bg-gray-900">
        <div className="relative h-44 sm:h-60 w-full overflow-hidden">
          <img
            src="/src/assets/images/barbershop_hero_interior_1792249603398.jpg"
            alt="Ambiente Barbearia Elite"
            className="w-full h-full object-cover brightness-[0.65]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/70 to-transparent" />
          <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-left">
            <span className="self-start text-[10px] sm:text-xs uppercase tracking-widest bg-blue-600/30 border border-blue-400/30 text-blue-300 px-2.5 py-0.5 rounded-full font-bold mb-2">
              Destaque da Barbearia
            </span>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight">
              {bannerText}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 line-clamp-2">
              Escolha seu barbeiro, data e horário ideal em poucos toques no celular.
            </p>
          </div>
        </div>
      </div>

      {/* Success notification if latest booked */}
      {latestAppointment && (
        <div className="bg-gray-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-400">Horário Marcado com Sucesso!</p>
              <h4 className="font-bold text-sm text-white mt-0.5">
                {latestAppointment.serviceName} com {latestAppointment.barberName}
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {latestAppointment.date || 'Hoje'} às <strong className="text-gray-200">{latestAppointment.time}</strong> • R$ {latestAppointment.price.toFixed(2)} ({latestAppointment.paymentMethod})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={getWhatsAppBookingLink(
                latestAppointment.clientPhone,
                shopName,
                latestAppointment.serviceName,
                latestAppointment.barberName,
                latestAppointment.time,
                latestAppointment.price
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            {latestAppointment.paymentMethod === 'Pix Online' && (
              <button
                onClick={() => setShowPixModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[44px]"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                QR Pix
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Booking Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4 sm:space-y-5"
      >
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Scissors className="w-4 h-4 text-blue-400" />
            Marcar Horário Online
          </h3>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">Total</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-400 tabular-nums">
              R$ {selectedService.price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 1. Escolha o Serviço */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            1. Serviço Desejado
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {services.map((service) => {
              const isSelected = selectedService.id === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={`p-3 rounded-xl sm:rounded-2xl text-left border transition-all flex flex-col justify-between min-h-[64px] active:scale-[0.98] ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500 text-white shadow-md'
                      : 'bg-gray-950 border-gray-800 hover:border-gray-700 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs sm:text-sm text-white">{service.name}</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.durationMinutes}m
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">Valor</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Escolha o Barbeiro */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            2. Barbeiro de Preferência
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {barbers.map((barber) => {
              const isSelected = selectedBarber === barber.name;
              return (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => setSelectedBarber(barber.name)}
                  className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left flex items-center gap-2.5 transition-all min-h-[50px] active:scale-[0.98] ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-800 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                    💈
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-white truncate">{barber.name}</p>
                    <p className="text-[10px] text-gray-400">Barbeiro</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Data e Horário */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            3. Data e Horário
          </label>
          <div className="flex gap-2 mb-2.5">
            {['Hoje', 'Amanhã', 'Depois'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  selectedDate === d
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-950 border border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                {d}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {AVAILABLE_TIMES.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold tabular-nums transition-all min-h-[42px] active:scale-[0.96] ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                      : 'bg-gray-950 border border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Dados do Cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Seu Nome
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              WhatsApp
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={clientPhone}
                onChange={handlePhoneChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
                required
              />
            </div>
          </div>
        </div>

        {/* 5. Pagamento e Observações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
            >
              <option value="Pix Online">⚡ Pix Online (Gera QR Code)</option>
              <option value="Pix Local">Pix no Local</option>
              <option value="Dinheiro Local">Dinheiro no Local</option>
              <option value="Cartão Local">Cartão no Local</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              Observação (Opcional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Ex: Disfarçado baixo na navalha..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all text-sm sm:text-base min-h-[48px] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Confirmar Agendamento</span>
          <span aria-hidden="true">•</span>
          <span className="tabular-nums">R$ {selectedService.price.toFixed(2)}</span>
        </button>
      </form>

      {/* Pix Modal */}
      <PixModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        title={`Pix para ${shopName}`}
        amount={selectedService.price}
        receiver={shopName}
        description={`Agendamento para ${selectedService.name} às ${selectedTime}`}
        onConfirmSuccess={() => {
          setToastMessage('Pagamento Pix confirmado!');
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />
    </div>
  );
};
