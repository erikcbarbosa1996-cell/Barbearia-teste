/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Sparkles,
  Lock,
  LogOut,
  Calendar,
  Clock,
  User,
  Phone,
  Check,
  CheckCircle2,
  Copy,
  Plus,
  Trash2,
  Edit2,
  MessageCircle,
  Volume2,
  Image as ImageIcon,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  QrCode,
  X,
  FileText,
  DollarSign,
  ShieldCheck,
  Smartphone,
  Eye,
  Download,
  Camera,
  Upload
} from 'lucide-react';
import { PixQrVisual } from './components/PixQrVisual';
import { generatePixCopiaECola, formatPhoneNumber, getWhatsAppBookingLink } from './utils/pix';
import { playNotificationSound } from './utils/audio';
import { compressImageFile, getInitials } from './utils/image';
import { GalleryPost, GalleryComment } from './types';
import { GalleryFeedView } from './components/GalleryFeedView';
import { AdminGalleryManager } from './components/AdminGalleryManager';

// ================= TIPAGENS =================
export type Barber = {
  id: string;
  name: string;
  commission?: number;
  avatar: string;
  specialty: string;
  available: boolean;
};

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  badge?: string;
  image: string;
  description: string;
};

export type BannerSlide = {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
};

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export type PaymentMethod = 'Pix Online' | 'Pix Local' | 'Cartão no Local' | 'Dinheiro no Local';

export type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  barberName: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ================= DADOS INICIAIS =================
const DEFAULT_BANNERS: BannerSlide[] = [
  {
    id: 'b1',
    title: '🔥 50% OFF na Primeira Barba do Mês',
    subtitle: 'Viva uma experiência tradicional com toalha quente e navalha afiada.',
    tag: 'Destaque VIP',
    image: '/src/assets/images/barbershop_hero_interior_1792249603398.jpg',
  },
  {
    id: 'b2',
    title: 'Acabamento & Degradê Perfeito',
    subtitle: 'Profissionais especialistas em cortes modernos, visagismo e barba alinhada.',
    tag: 'Técnica & Precisão',
    image: '/src/assets/images/haircut_fade_1792254598941.jpg',
  },
  {
    id: 'b3',
    title: 'Corte + Barboterapia Completa',
    subtitle: 'Combo exclusivo com massagem facial e produtos premium importados.',
    tag: 'Mais Vendido',
    image: '/src/assets/images/barbershop_hero_interior_1792249603398.jpg',
  },
];

const DEFAULT_BARBERS: Barber[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    commission: 50,
    avatar: '',
    specialty: 'Degradê & Navalhado',
    available: true,
  },
  {
    id: '2',
    name: 'Marcos Vinicius',
    commission: 50,
    avatar: '',
    specialty: 'Barboterapia & Tesoura',
    available: true,
  },
  {
    id: '3',
    name: 'André Santos',
    commission: 50,
    avatar: '',
    specialty: 'Cortes Clássicos & Freestyle',
    available: true,
  },
];

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 's1',
    name: 'Corte Degradê Navalhado',
    price: 45,
    durationMinutes: 35,
    badge: '🔥 MAIS PEDIDO',
    image: '/src/assets/images/haircut_fade_1792254598941.jpg',
    description: 'Fade impecável na máquina e navalha, com alinhamento de pezinho e finalização.',
  },
  {
    id: 's2',
    name: 'Barba Completa com Toalha Quente',
    price: 35,
    durationMinutes: 25,
    badge: '💈 TRADIÇÃO',
    image: '/src/assets/images/barbershop_hero_interior_1792249603398.jpg',
    description: 'Rito tradicional com vapor quente, esfoliação facial, navalha e óleo nutritivo.',
  },
  {
    id: 's3',
    name: 'Combo Elite (Corte + Barba)',
    price: 75,
    durationMinutes: 55,
    badge: '👑 PACOTE VIP',
    image: '/src/assets/images/barbershop_hero_interior_1792249603398.jpg',
    description: 'A transformação visual completa para quem exige o padrão mais alto de alinhamento.',
  },
  {
    id: 's4',
    name: 'Pezinho & Sobrancelha',
    price: 25,
    durationMinutes: 20,
    badge: '⚡ EXPRESS',
    image: '/src/assets/images/haircut_fade_1792254598941.jpg',
    description: 'Manutenção rápida dos contornos e design de sobrancelha na lâmina.',
  },
];

const DEFAULT_GALLERY_POSTS: GalleryPost[] = [
  {
    id: 'post_1',
    imageUrl: '/src/assets/images/beard_sculpted_trim_1792256809232.jpg',
    caption: 'Alinhamento de barba na navalha com acabamento milimétrico e toalha quente aromática.',
    authorName: 'Barbearia Imperial Elite',
    isBarberPost: true,
    barberName: 'Marcos Vinicius',
    likes: 42,
    likedByMe: false,
    status: 'APPROVED',
    createdAt: 'Hoje',
    comments: [
      {
        id: 'c1',
        authorName: 'Felipe Rocha',
        text: 'Trabalho de outro nível! O Marcos é monstro na navalha.',
        isBarberReply: false,
        createdAt: 'Há 2 horas'
      },
      {
        id: 'c2',
        authorName: 'Barbearia Imperial Elite',
        text: 'Valeu demais meu amigo! Sempre um prazer atender você aqui na cadeira VIP.',
        isBarberReply: true,
        createdAt: 'Há 1 hora'
      }
    ]
  },
  {
    id: 'post_2',
    imageUrl: '/src/assets/images/modern_fade_crop_1792256821924.jpg',
    caption: 'High fade degradê na máquina zero com textura no topo estilo crop europeu.',
    authorName: 'Barbearia Imperial Elite',
    isBarberPost: true,
    barberName: 'Carlos Silva',
    likes: 67,
    likedByMe: true,
    status: 'APPROVED',
    createdAt: 'Ontem',
    comments: [
      {
        id: 'c3',
        authorName: 'Rodrigo Nogueira',
        text: 'Degradê mais limpo da cidade sem dúvidas!',
        isBarberReply: false,
        createdAt: 'Ontem'
      },
      {
        id: 'c4',
        authorName: 'Barbearia Imperial Elite',
        text: 'Técnica e precisão em cada detalhe! Te esperamos de volta na próxima semana.',
        isBarberReply: true,
        createdAt: 'Ontem'
      }
    ]
  },
  {
    id: 'post_3',
    imageUrl: '/src/assets/images/haircut_fade_1792254598941.jpg',
    caption: 'Corte degradê navalhado + pezinho desenhado na lâmina para o final de semana.',
    authorName: 'Gabriel Souza',
    isBarberPost: false,
    barberName: 'André Santos',
    likes: 29,
    likedByMe: false,
    status: 'APPROVED',
    createdAt: 'Há 2 dias',
    comments: [
      {
        id: 'c5',
        authorName: 'Thiago Costa',
        text: 'Ficou top irmão, combinou muito contigo!',
        isBarberReply: false,
        createdAt: 'Há 2 dias'
      }
    ]
  }
];

const ALL_TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

export default function App() {
  // ================= ESTADOS PRINCIPAIS =================
  // Isolamento de Telas: Cliente (Público) vs Loja (Área Restrita)
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('barber_admin_auth') === 'true';
  });

  // Modal de Login
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sub-aba do Cliente: Agendamento ou Galeria
  const [clientSubTab, setClientSubTab] = useState<'booking' | 'gallery'>('booking');

  // Sub-abas do Painel da Loja
  const [adminTab, setAdminTab] = useState<'overview' | 'services' | 'banners' | 'team' | 'gallery' | 'saas'>('overview');

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Dados da Barbearia
  const [shopName, setShopName] = useState(() => localStorage.getItem('barber_name') || 'Barbearia Imperial Elite');
  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    const s = localStorage.getItem('barber_banners');
    return s ? JSON.parse(s) : DEFAULT_BANNERS;
  });
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const s = localStorage.getItem('barber_services_v2');
    return s ? JSON.parse(s) : DEFAULT_SERVICES;
  });
  const [barbers, setBarbers] = useState<Barber[]>(() => {
    try {
      const s = localStorage.getItem('barber_team_v2');
      if (s) {
        const parsed: Barber[] = JSON.parse(s);
        return parsed.map((b) => ({
          ...b,
          avatar: b.avatar && !b.avatar.includes('unsplash.com') ? b.avatar : '',
        }));
      }
    } catch (e) {
      console.warn('Error reading barbers from storage', e);
    }
    return DEFAULT_BARBERS;
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const s = localStorage.getItem('barber_appointments_v2');
    return s
      ? JSON.parse(s)
      : [
          {
            id: 'a1',
            clientName: 'Matheus Pereira',
            clientPhone: '(21) 98888-7766',
            barberName: 'Carlos Silva',
            serviceName: 'Corte Degradê Navalhado',
            price: 45,
            date: 'Hoje',
            time: '14:00',
            paymentMethod: 'Pix Online',
            status: 'SCHEDULED',
            createdAt: '13:15',
          },
          {
            id: 'a2',
            clientName: 'Gabriel Souza',
            clientPhone: '(21) 97777-6655',
            barberName: 'Marcos Vinicius',
            serviceName: 'Combo Elite (Corte + Barba)',
            price: 75,
            date: 'Hoje',
            time: '16:00',
            paymentMethod: 'Pix Local',
            status: 'COMPLETED',
            createdAt: '15:10',
          },
        ];
  });

  // Galeria Interativa com Moderação, Comentários e Curtidas
  const [galleryPosts, setGalleryPosts] = useState<GalleryPost[]>(() => {
    try {
      const s = localStorage.getItem('barber_gallery_posts_v1');
      return s ? JSON.parse(s) : DEFAULT_GALLERY_POSTS;
    } catch (e) {
      console.warn('Error reading gallery from storage', e);
      return DEFAULT_GALLERY_POSTS;
    }
  });

  const pendingGalleryCount = galleryPosts.filter((p) => p.status === 'PENDING').length;
  const approvedGalleryCount = galleryPosts.filter((p) => p.status === 'APPROVED').length;

  // Estados do Formulário do Cliente
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedService, setSelectedService] = useState<ServiceItem>(services[0] || DEFAULT_SERVICES[0]);
  const [selectedBarber, setSelectedBarber] = useState<string>(barbers[0]?.name || 'Carlos Silva');
  const [selectedDate, setSelectedDate] = useState('Hoje');
  const [selectedTime, setSelectedTime] = useState('15:00');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix Online');
  const [clientNotes, setClientNotes] = useState('');

  // Modais de Notificação & Pix
  const [showPixModal, setShowPixModal] = useState(false);
  const [latestAppointment, setLatestAppointment] = useState<Appointment | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Estados de Criação / Edição no Admin
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(45);
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServiceBadge, setNewServiceBadge] = useState('NOVO');
  const [newServiceImage, setNewServiceImage] = useState('/src/assets/images/haircut_fade_1792254598941.jpg');

  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImage, setNewBannerImage] = useState('');
  const [newBannerTag, setNewBannerTag] = useState('Destaque');

  const [newBarberName, setNewBarberName] = useState('');
  const [newBarberCommission, setNewBarberCommission] = useState('');
  const [newBarberSpecialty, setNewBarberSpecialty] = useState('Barbeiro Especialista');
  const [newBarberAvatar, setNewBarberAvatar] = useState('');

  // Upload de Foto da Galeria do Aparelho (Celular / Computador) com compressão ultra-rápida
  const handleBarberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 400, 400, 0.85);
        setNewBarberAvatar(compressed);
        setToastMsg('Foto carregada com sucesso da sua galeria!');
        setTimeout(() => setToastMsg(null), 2500);
      } catch (err) {
        setToastMsg('⚠️ Não foi possível carregar a imagem da galeria.');
        setTimeout(() => setToastMsg(null), 3000);
      }
    }
  };

  const handleExistingBarberPhotoUpload = async (id: string, file: File) => {
    try {
      const compressed = await compressImageFile(file, 400, 400, 0.85);
      setBarbers((prev) => prev.map((b) => (b.id === id ? { ...b, avatar: compressed } : b)));
      setToastMsg('Foto do barbeiro atualizada pela galeria!');
      setTimeout(() => setToastMsg(null), 2500);
    } catch (err) {
      setToastMsg('⚠️ Não foi possível processar a foto.');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleRemoveExistingBarberPhoto = (id: string) => {
    setBarbers((prev) => prev.map((b) => (b.id === id ? { ...b, avatar: '' } : b)));
    setToastMsg('Foto removida. O barbeiro usará iniciais elegantes.');
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleServicePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 600, 600, 0.85);
        setNewServiceImage(compressed);
        setToastMsg('Foto do corte carregada da sua galeria!');
        setTimeout(() => setToastMsg(null), 2500);
      } catch (err) {
        setToastMsg('⚠️ Não foi possível carregar a imagem do corte.');
        setTimeout(() => setToastMsg(null), 3000);
      }
    }
  };

  // Filtro de Agendamentos no Admin
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELED'>('ALL');

  // ================= SINCRONIZAÇÃO LOCALSTORAGE =================
  useEffect(() => {
    try {
      localStorage.setItem('barber_name', shopName);
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [shopName]);

  useEffect(() => {
    try {
      localStorage.setItem('barber_banners', JSON.stringify(banners));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem('barber_services_v2', JSON.stringify(services));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem('barber_team_v2', JSON.stringify(barbers));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [barbers]);

  useEffect(() => {
    try {
      localStorage.setItem('barber_appointments_v2', JSON.stringify(appointments));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem('barber_admin_auth', isAdminAuthenticated ? 'true' : 'false');
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('barber_gallery_posts_v1', JSON.stringify(galleryPosts));
    } catch (e) {
      console.warn('Storage error on gallery', e);
    }
  }, [galleryPosts]);

  // Listener para PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Rotação suave do carrossel no cliente
  useEffect(() => {
    if (viewMode !== 'client' || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length, viewMode]);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('Para instalar no celular, abra as opções do seu navegador e toque em "Adicionar à Tela Inicial" ou "Instalar Aplicativo".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  // ================= CÁLCULO DA MENSALIDADE SAAS =================
  // Regra solicitada:
  // 1 Barbeiro: R$ 100,00
  // 2 Barbeiros: R$ 190,00
  // 3 Barbeiros: R$ 270,00
  // 4+ Barbeiros: R$ 270,00 + R$ 80,00 por barbeiro extra
  const calculateMonthlyFee = (count: number) => {
    if (count <= 1) return 100;
    if (count === 2) return 190;
    if (count === 3) return 270;
    return 270 + (count - 3) * 80;
  };

  const currentMonthlyFee = calculateMonthlyFee(barbers.length);

  // ================= CONTROLE DE AUTENTICAÇÃO =================
  const handleOpenLogin = () => {
    setLoginError(null);
    setLoginUser('');
    setLoginPass('');
    setIsLoginModalOpen(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser.trim() === 'admin' && loginPass.trim() === '1234') {
      setIsAdminAuthenticated(true);
      setViewMode('admin');
      setIsLoginModalOpen(false);
      setToastMsg('Acesso autorizado ao Painel da Barbearia!');
      setTimeout(() => setToastMsg(null), 3000);
    } else {
      setLoginError('Credenciais inválidas. Use usuário: admin e senha: 1234');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setViewMode('client');
    setToastMsg('Você saiu do painel da barbearia.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ================= AÇÕES DO CLIENTE =================
  // Identifica horários já ocupados para o barbeiro e data escolhidos
  const occupiedSlots = appointments
    .filter(
      (a) =>
        a.barberName === selectedBarber &&
        a.date === selectedDate &&
        a.status === 'SCHEDULED'
    )
    .map((a) => a.time);

  const handleClientBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || clientPhone.length < 10) {
      alert('Por favor, informe seu nome e WhatsApp com DDD!');
      return;
    }

    if (occupiedSlots.includes(selectedTime)) {
      alert('Este horário acabou de ser preenchido. Por favor, escolha outro horário disponível.');
      return;
    }

    const newAppt: Appointment = {
      id: `a_${Date.now()}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      barberName: selectedBarber,
      serviceName: selectedService.name,
      price: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      paymentMethod,
      status: 'SCHEDULED',
      notes: clientNotes.trim() || undefined,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAppointments([newAppt, ...appointments]);
    setLatestAppointment(newAppt);

    // Aviso sonoro premium
    playNotificationSound();

    if (paymentMethod === 'Pix Online') {
      setShowPixModal(true);
    } else {
      setToastMsg(`Agendamento confirmado para as ${selectedTime}!`);
      setTimeout(() => setToastMsg(null), 4000);
    }

    setClientName('');
    setClientPhone('');
    setClientNotes('');
  };

  // ================= AÇÕES DO ADMINISTRADOR =================
  // Serviços
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) {
      setToastMsg('⚠️ Digite o nome do serviço!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const newS: ServiceItem = {
      id: `s_${Date.now()}`,
      name: newServiceName.trim(),
      price: Number(newServicePrice) || 35,
      durationMinutes: Number(newServiceDuration) || 30,
      badge: newServiceBadge.trim() || undefined,
      image: newServiceImage.trim() || '/src/assets/images/haircut_fade_1792254598941.jpg',
      description: 'Atendimento com produtos selecionados e padrão premium.',
    };

    setServices([...services, newS]);
    setNewServiceName('');
    setNewServicePrice(45);
    setNewServiceDuration(30);
    setToastMsg(`Serviço "${newS.name}" cadastrado com sucesso!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleUpdateServicePrice = (id: string, newPrice: number) => {
    setServices(services.map((s) => (s.id === id ? { ...s, price: newPrice } : s)));
  };

  const handleUpdateServiceName = (id: string, newName: string) => {
    setServices(services.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  };

  const handleDeleteService = (id: string) => {
    if (services.length <= 1) {
      setToastMsg('⚠️ Você deve manter pelo menos 1 serviço ativo no catálogo.');
      setTimeout(() => setToastMsg(null), 3500);
      return;
    }
    const removedService = services.find((s) => s.id === id);
    setServices(services.filter((s) => s.id !== id));
    if (selectedService.id === id) {
      setSelectedService(services.find((s) => s.id !== id) || services[0]);
    }
    setToastMsg(`Serviço "${removedService?.name || ''}" excluído com sucesso!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Banners
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim()) {
      setToastMsg('⚠️ Digite o título do banner!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const newB: BannerSlide = {
      id: `b_${Date.now()}`,
      title: newBannerTitle.trim(),
      subtitle: newBannerSubtitle.trim() || 'Promoção válida por tempo limitado.',
      tag: newBannerTag.trim() || 'Destaque',
      image: newBannerImage.trim() || '/src/assets/images/barbershop_hero_interior_1792249603398.jpg',
    };

    setBanners([...banners, newB]);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    setNewBannerImage('');
    setToastMsg('Banner promocional adicionado ao carrossel!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteBanner = (id: string) => {
    if (banners.length <= 1) {
      setToastMsg('⚠️ O carrossel precisa de pelo menos 1 banner ativo.');
      setTimeout(() => setToastMsg(null), 3500);
      return;
    }
    setBanners(banners.filter((b) => b.id !== id));
    setToastMsg('Banner removido do carrossel!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Barbeiros
  const handleAddBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) {
      setToastMsg('⚠️ Digite o nome do barbeiro!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    const commissionNum = newBarberCommission.trim() !== '' ? Number(newBarberCommission) : undefined;

    const newB: Barber = {
      id: `barber_${Date.now()}`,
      name: newBarberName.trim(),
      commission: commissionNum,
      avatar: newBarberAvatar.trim(), // Imagem real da galeria ou vazia (usará iniciais)
      specialty: newBarberSpecialty.trim() || 'Barbeiro Profissional',
      available: true,
    };

    const updatedBarbers = [...barbers, newB];
    setBarbers(updatedBarbers);
    if (!selectedBarber || barbers.length === 0) {
      setSelectedBarber(newB.name);
    }
    setNewBarberName('');
    setNewBarberCommission('');
    setNewBarberAvatar('');
    setToastMsg(`Barbeiro ${newB.name} adicionado! Mensalidade: R$ ${calculateMonthlyFee(updatedBarbers.length)},00`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeleteBarber = (id: string) => {
    const removedBarber = barbers.find((b) => b.id === id);
    const updated = barbers.filter((b) => b.id !== id);
    setBarbers(updated);
    if (selectedBarber === removedBarber?.name) {
      setSelectedBarber(updated[0]?.name || '');
    }
    setToastMsg(`Barbeiro ${removedBarber?.name || ''} excluído com sucesso! Nova mensalidade: R$ ${calculateMonthlyFee(updated.length)},00`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateBarberAvatar = (id: string, newAvatar: string) => {
    setBarbers(barbers.map((b) => (b.id === id ? { ...b, avatar: newAvatar } : b)));
    setToastMsg('Foto do barbeiro atualizada com sucesso!');
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Agendamentos Status
  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  // Estatísticas do Admin
  const scheduledCount = appointments.filter((a) => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const todayRevenue = appointments
    .filter((a) => a.status === 'COMPLETED')
    .reduce((acc, a) => acc + a.price, 0);

  const totalMonthlyBilling = 4850 + todayRevenue;

  // Pix Payload para pagamento da mensalidade SaaS da Barbearia
  const saasPixKey = generatePixCopiaECola(
    'pagamentos@plataformabarber.com.br',
    'PLATAFORMA SAAS BARBER',
    'SAO PAULO',
    currentMonthlyFee,
    'MENSALIDADE'
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-100 font-sans selection:bg-amber-500 selection:text-black pb-28 md:pb-12">
      {/* Toast Notifier */}
      {toastMsg && (
        <div className="fixed top-5 left-4 right-4 md:left-auto md:right-6 z-50 bg-gradient-to-r from-amber-600 to-amber-500 text-black font-extrabold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-black" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= BARRA DE TOPO PREMIUM (GLASSMORPHISM) ================= */}
      <header className="sticky top-0 z-40 bg-[#0E1522]/85 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo & Marca Dourada */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
              <Scissors className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  {shopName}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  {viewMode === 'admin' ? 'Painel Gestor' : 'VIP Club'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                Agendamentos rápidos & atendimento exclusivo
              </p>
            </div>
          </div>

          {/* Botão de Troca / Login de Modo */}
          <div className="flex items-center gap-2">
            {viewMode === 'client' ? (
              <button
                onClick={handleOpenLogin}
                className="px-3 py-1.5 rounded-xl bg-[#161F2E]/90 hover:bg-[#1E2B3E] border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Acessar o painel restrito da barbearia"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>🔐 Sou o Barbeiro</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('client')}
                  className="px-3 py-1.5 rounded-xl bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Ver como o cliente enxerga"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ver Tela Cliente</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Sair do painel administrativo"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= CORPO PRINCIPAL ================= */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* ============================================================== */}
        {/* 1. VISÃO DO CLIENTE (100% PÚBLICA, VISUAL & ALTA CONVERSÃO) */}
        {/* ============================================================== */}
        {viewMode === 'client' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Aviso PWA sutil */}
            {isInstallable && (
              <div className="bg-[#161F2E]/80 backdrop-blur-md border border-amber-500/30 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-xs text-gray-200">
                    Instale nosso aplicativo direto no seu celular para agendar com 1 toque!
                  </p>
                </div>
                <button
                  onClick={handleInstallPWA}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shrink-0 transition-transform active:scale-95"
                >
                  Baixar App
                </button>
              </div>
            )}

            {/* 1. CARROSSEL INICIAL DE DESTAQUES */}
            {banners.length > 0 && (
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#161F2E]/80 shadow-2xl">
                <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden">
                  <img
                    src={banners[carouselIndex]?.image || '/src/assets/images/barbershop_hero_interior_1792249603398.jpg'}
                    alt={banners[carouselIndex]?.title}
                    className="w-full h-full object-cover brightness-[0.55] transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/50 to-transparent" />
                  
                  {/* Conteúdo do Slide com recuo de segurança para as setas */}
                  <div className="absolute inset-0 pl-12 pr-12 sm:pl-16 sm:pr-16 py-4 sm:py-6 flex flex-col justify-end text-left z-10">
                    <span className="self-start text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 mb-1.5 sm:mb-2">
                      {banners[carouselIndex]?.tag || 'Exclusivo'}
                    </span>
                    <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug sm:leading-tight max-w-xl">
                      {banners[carouselIndex]?.title}
                    </h2>
                    <p className="text-[11px] sm:text-xs md:text-sm text-gray-300 mt-1 max-w-lg line-clamp-2">
                      {banners[carouselIndex]?.subtitle}
                    </p>
                  </div>

                  {/* Controles do Carrossel com Z-Index e posições seguras */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                        className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all shadow-lg active:scale-90"
                        aria-label="Slide anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCarouselIndex((prev) => (prev + 1) % banners.length)}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all shadow-lg active:scale-90"
                        aria-label="Próximo slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Pontos / Dots interativos */}
                      <div className="absolute bottom-2.5 right-4 z-20 flex items-center gap-1.5">
                        {banners.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCarouselIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              i === carouselIndex ? 'w-6 bg-amber-500' : 'w-2 bg-white/30'
                            }`}
                            aria-label={`Ir para slide ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Agendamento Realizado Card */}
            {latestAppointment && (
              <div className="bg-[#161F2E]/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                      Agendamento Confirmado!
                    </span>
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      {latestAppointment.serviceName} com {latestAppointment.barberName}
                    </h4>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {latestAppointment.date} às <strong className="text-white">{latestAppointment.time}</strong> · Total: <span className="text-amber-400 font-extrabold">R$ {latestAppointment.price.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar WhatsApp
                  </a>
                  {latestAppointment.paymentMethod === 'Pix Online' && (
                    <button
                      onClick={() => setShowPixModal(true)}
                      className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-amber-400" />
                      Ver Pix
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 2. FORMULÁRIO DE AGENDAMENTO (CARDS COM FOTO + BORDA DOURADA) */}
            <form onSubmit={handleClientBooking} className="space-y-6">
              {/* SELEÇÃO DE SERVIÇOS (CARDS INTERATIVOS COM FOTO) */}
              <div className="bg-[#161F2E]/80 backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-amber-400" />
                      1. Escolha o Serviço
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Toque no corte desejado para selecionar
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">Investimento</span>
                    <span className="text-base sm:text-xl font-black text-amber-400 tabular-nums">
                      R$ {selectedService.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                  {services.map((srv) => {
                    const isSelected = selectedService.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`cursor-pointer rounded-2xl p-3.5 sm:p-4 border transition-all duration-200 relative flex gap-3.5 items-center select-none active:scale-[0.99] ${
                          isSelected
                            ? 'bg-[#1F2C40] border-amber-500 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                            : 'bg-[#0E1522]/90 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Foto do Corte */}
                        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl overflow-hidden shrink-0 relative bg-black/40 border border-white/10">
                          <img
                            src={srv.image || '/src/assets/images/haircut_fade_1792254598941.jpg'}
                            alt={srv.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          {/* Badge do corte */}
                          {srv.badge && (
                            <span className="absolute bottom-1 left-1 right-1 text-[8px] font-black uppercase text-center bg-black/80 text-amber-300 py-0.5 px-1 rounded backdrop-blur-sm">
                              {srv.badge}
                            </span>
                          )}
                        </div>

                        {/* Detalhes do Corte */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-extrabold text-sm text-white truncate">
                              {srv.name}
                            </h4>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 shadow-sm">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                            {srv.description}
                          </p>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {srv.durationMinutes} min
                            </span>
                            <span className="text-sm sm:text-base font-black text-amber-400 tabular-nums">
                              R$ {srv.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. SELEÇÃO DE BARBEIRO COM AVATAR & DISPONIBILIDADE */}
              <div className="bg-[#161F2E]/80 backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    2. Escolha seu Barbeiro
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Profissionais qualificados prontos para te atender
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {barbers.length === 0 ? (
                    <div className="col-span-full p-4 text-center text-xs text-gray-400 bg-[#0E1522] rounded-2xl border border-white/5">
                      Nenhum barbeiro cadastrado no momento. Cadastre profissionais no Painel da Loja.
                    </div>
                  ) : (
                    barbers.map((barber) => {
                      const isSelected = selectedBarber === barber.name;
                      return (
                        <div
                          key={barber.id}
                          onClick={() => setSelectedBarber(barber.name)}
                          className={`cursor-pointer rounded-2xl p-3 border transition-all flex items-center gap-3 active:scale-[0.98] ${
                            isSelected
                              ? 'bg-[#1F2C40] border-amber-500 ring-2 ring-amber-500/40 shadow-md'
                              : 'bg-[#0E1522]/90 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* Avatar com Dot Verde */}
                          <div className="relative shrink-0">
                            {barber.avatar ? (
                              <img
                                src={barber.avatar}
                                alt={barber.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/40 border-2 border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-sm shadow-md">
                                {getInitials(barber.name)}
                              </div>
                            )}
                            <span
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0B0F17] rounded-full"
                              title="Disponível para atendimento"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-white truncate">{barber.name}</p>
                            <p className="text-[11px] text-gray-400 truncate">{barber.specialty}</p>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 4. GRID DE HORÁRIOS EM BOTÕES (PILLS) */}
              <div className="bg-[#161F2E]/80 backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    3. Data & Horário
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Horários ocupados aparecem riscados e bloqueados
                  </p>
                </div>

                {/* Escolha do Dia */}
                <div className="flex gap-2">
                  {['Hoje', 'Amanhã', 'Depois'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                        selectedDate === d
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                          : 'bg-[#0E1522] border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Grid de Horários */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
                  {ALL_TIME_SLOTS.map((slot) => {
                    const isOccupied = occupiedSlots.includes(slot);
                    const isSelected = selectedTime === slot;

                    if (isOccupied) {
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled
                          className="py-2.5 px-2 rounded-xl text-xs font-mono font-semibold bg-[#0B0F17]/50 border border-white/5 text-gray-600 line-through cursor-not-allowed opacity-50"
                          title="Horário já reservado por outro cliente"
                        >
                          {slot}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all min-h-[42px] active:scale-95 ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-black ring-1 ring-amber-400'
                            : 'bg-[#0E1522] border border-white/10 text-gray-300 hover:border-amber-500/50 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. DADOS DO CLIENTE & PAGAMENTO */}
              <div className="bg-[#161F2E]/80 backdrop-blur-md border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    4. Seus Dados & Pagamento
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Seu Nome Completo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Matheus Lima"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500 min-h-[46px]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      WhatsApp (com DDD)
                    </label>
                    <input
                      type="text"
                      placeholder="(21) 99999-9999"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(formatPhoneNumber(e.target.value))}
                      className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500 min-h-[46px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500 min-h-[46px]"
                    >
                      <option value="Pix Online">⚡ Pix Online (Gera QR Code na hora)</option>
                      <option value="Pix Local">Pix no Balcão da Barbearia</option>
                      <option value="Cartão no Local">Cartão de Crédito / Débito no Local</option>
                      <option value="Dinheiro no Local">Dinheiro em Espécie</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">
                      Observações para o Barbeiro (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Disfarçado na navalha, toalha bem quente..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      className="w-full bg-[#0B0F17] border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-500 min-h-[46px]"
                    />
                  </div>
                </div>

                {/* BOTÃO DE CONFIRMAR AGENDAMENTO DOURADO */}
                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-black py-4 rounded-2xl shadow-xl shadow-amber-500/20 text-base sm:text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.99] min-h-[52px]"
                >
                  <Sparkles className="w-5 h-5 fill-black" />
                  <span>Confirmar Agendamento</span>
                  <span>•</span>
                  <span className="tabular-nums">R$ {selectedService.price.toFixed(2)}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. PAINEL DA LOJA / ADMINISTRAÇÃO COMPLETA (ÁREA RESTRITA)   */}
        {/* ============================================================== */}
        {viewMode === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header com Abas Administrativas */}
            <div className="bg-[#161F2E]/90 border border-white/10 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                  Painel de Controle
                </span>
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {shopName}
                </span>
              </div>

              {/* Sub-Abas do Painel */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setAdminTab('overview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'overview'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  📊 Visão Geral
                </button>
                <button
                  onClick={() => setAdminTab('services')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'services'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ✂️ Cortes & Preços
                </button>
                <button
                  onClick={() => setAdminTab('banners')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'banners'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  🖼️ Carrossel
                </button>
                <button
                  onClick={() => setAdminTab('team')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'team'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  👥 Equipe ({barbers.length})
                </button>
                <button
                  onClick={() => setAdminTab('saas')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    adminTab === 'saas'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  💰 Mensalidade SaaS
                </button>
              </div>
            </div>

            {/* ABA: VISÃO GERAL & FILA DE CORTES */}
            {adminTab === 'overview' && (
              <div className="space-y-6">
                {/* 4 Cards de Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#161F2E]/80 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cortes Hoje</span>
                    <h4 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 tabular-nums">
                      {scheduledCount + completedCount}
                    </h4>
                    <span className="text-[11px] text-gray-400">{scheduledCount} na fila de espera</span>
                  </div>

                  <div className="bg-[#161F2E]/80 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Faturamento Hoje</span>
                    <h4 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tabular-nums">
                      R$ {todayRevenue.toFixed(2)}
                    </h4>
                    <span className="text-[11px] text-gray-400">{completedCount} cortes finalizados</span>
                  </div>

                  <div className="bg-[#161F2E]/80 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Faturamento Mês</span>
                    <h4 className="text-2xl sm:text-3xl font-black text-white mt-1 tabular-nums">
                      R$ {totalMonthlyBilling.toLocaleString('pt-BR')}
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-semibold">+18% vs mês passado</span>
                  </div>

                  <div className="bg-[#161F2E]/80 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Mensalidade App</span>
                    <h4 className="text-2xl sm:text-3xl font-black text-purple-400 mt-1 tabular-nums">
                      R$ {currentMonthlyFee}
                    </h4>
                    <span className="text-[11px] text-gray-400">Para {barbers.length} barbeiros</span>
                  </div>
                </div>

                {/* Fila de Agendamentos do Dia */}
                <div className="bg-[#161F2E]/80 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      Fila de Agendamentos (Tempo Real)
                    </h3>

                    {/* Filtros */}
                    <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded-xl border border-white/10 text-xs">
                      {(['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELED'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                            statusFilter === st ? 'bg-amber-500 text-black font-bold' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {st === 'ALL' && 'Todos'}
                          {st === 'SCHEDULED' && 'Aguardando'}
                          {st === 'COMPLETED' && 'Finalizados'}
                          {st === 'CANCELED' && 'Cancelados'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Atendimentos */}
                  <div className="space-y-2.5">
                    {appointments
                      .filter((a) => statusFilter === 'ALL' || a.status === statusFilter)
                      .map((item) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            item.status === 'COMPLETED'
                              ? 'bg-[#0E1522]/50 border-white/5 opacity-75'
                              : item.status === 'CANCELED'
                              ? 'bg-red-950/20 border-red-900/30 opacity-60'
                              : 'bg-[#0E1522] border-white/10 shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white">{item.clientName}</span>
                              <span className="text-xs text-gray-400 font-mono">({item.clientPhone})</span>
                              {item.status === 'COMPLETED' && (
                                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                                  ✓ Finalizado
                                </span>
                              )}
                              {item.status === 'CANCELED' && (
                                <span className="text-[10px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded">
                                  Cancelado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-amber-300 mt-0.5">
                              {item.serviceName} com <strong className="text-white">{item.barberName}</strong> às <strong className="text-white font-mono">{item.time}</strong>
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-gray-400 italic mt-0.5">"{item.notes}"</p>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-0 border-white/5 pt-2 sm:pt-0">
                            <div className="text-right mr-1">
                              <span className="text-xs font-black text-amber-400 tabular-nums block">
                                R$ {item.price.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-gray-400">{item.paymentMethod}</span>
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
                                className="p-2 rounded-xl bg-[#161F2E] hover:bg-emerald-600/30 border border-white/10 text-emerald-400 transition-colors"
                                title="Enviar mensagem no WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>

                              {item.status === 'SCHEDULED' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateAppointmentStatus(item.id, 'COMPLETED')}
                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
                                    title="Marcar corte como concluído"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Concluir
                                  </button>
                                  <button
                                    onClick={() => handleUpdateAppointmentStatus(item.id, 'CANCELED')}
                                    className="px-2 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-900/50 text-red-300 text-xs transition-colors"
                                    title="Cancelar horário"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {(item.status === 'COMPLETED' || item.status === 'CANCELED') && (
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(item.id, 'SCHEDULED')}
                                  className="px-2.5 py-1.5 rounded-xl bg-[#161F2E] text-gray-300 hover:text-white text-xs border border-white/10"
                                >
                                  Reabrir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA: GERENCIADOR DE SERVIÇOS & PREÇOS (EDIÇÃO EM TEMPO REAL) */}
            {adminTab === 'services' && (
              <div className="bg-[#161F2E]/80 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    Gerenciador de Serviços & Preços em Tempo Real
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Edite valores e nomes diretamente nas caixas de texto. As alterações são refletidas instantaneamente para os clientes.
                  </p>
                </div>

                {/* Formulário Novo Serviço com Labels Claras */}
                <form onSubmit={handleAddService} className="p-4 bg-[#0E1522] border border-white/10 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider block">
                      + Cadastrar Novo Corte / Tratamento
                    </span>
                    <span className="text-[11px] text-gray-400">Preencha cada campo abaixo:</span>
                  </div>

                  <div className="space-y-3">
                    {/* Campo 1: Nome do Serviço */}
                    <div>
                      <label className="block text-xs font-bold text-amber-400 mb-1">
                        🏷️ Nome do Serviço *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Corte Degradê Navalhado, Barboterapia, etc."
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Campo 2 e Campo 3 com Nomes Claros e Destacados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-amber-400 mb-1">
                          💰 Preço do Serviço (em Reais - R$) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="Ex: 45"
                            value={newServicePrice}
                            onChange={(e) => setNewServicePrice(Number(e.target.value))}
                            className="w-full bg-[#0B0F17] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Valor cobrado do cliente no atendimento</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-400 mb-1">
                          ⏱️ Tempo de Duração (em Minutos) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="5"
                            step="5"
                            placeholder="Ex: 30"
                            value={newServiceDuration}
                            onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                            className="w-full bg-[#0B0F17] border border-white/10 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">min</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">Tempo estimado gasto pelo barbeiro</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          ⭐ Destaque / Selo (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 🔥 MAIS PEDIDO ou 👑 VIP"
                          value={newServiceBadge}
                          onChange={(e) => setNewServiceBadge(e.target.value)}
                          className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          📸 Foto do Corte (Galeria do Celular / Aparelho)
                        </label>
                        <div className="flex items-center gap-3">
                          {newServiceImage ? (
                            <img
                              src={newServiceImage}
                              alt="Preview Corte"
                              className="w-11 h-11 rounded-xl object-cover border border-amber-500/50 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#0B0F17] border border-dashed border-white/20 flex items-center justify-center text-gray-400 shrink-0">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0B0F17] hover:bg-[#1A2536] border border-amber-500/30 text-amber-300 font-bold text-xs shadow-md transition-all active:scale-95">
                            <Upload className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
                            <span>{newServiceImage ? 'Trocar Foto da Galeria' : 'Escolher Foto da Galeria'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleServicePhotoUpload}
                              onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> Cadastrar Serviço
                    </button>
                  </div>
                </form>

                {/* Lista de Serviços com Edição Inline */}
                <div className="space-y-3">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 bg-[#0E1522] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={s.image || '/src/assets/images/haircut_fade_1792254598941.jpg'}
                          alt={s.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => handleUpdateServiceName(s.id, e.target.value)}
                            className="bg-transparent border-b border-transparent hover:border-amber-500/50 focus:border-amber-500 focus:bg-[#0B0F17] text-white font-bold text-sm w-full outline-none px-1 rounded transition-colors"
                            title="Clique para editar o nome diretamente"
                          />
                          <span className="text-[11px] text-gray-400 px-1">
                            {s.durationMinutes} minutos {s.badge && `• ${s.badge}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">R$</span>
                          <input
                            type="number"
                            value={s.price}
                            onChange={(e) => handleUpdateServicePrice(s.id, Number(e.target.value))}
                            className="w-20 bg-[#0B0F17] border border-white/10 focus:border-amber-500 rounded-lg p-1.5 text-sm font-black text-amber-400 text-right outline-none"
                            title="Edite o preço em tempo real"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteService(s.id)}
                          className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 border border-red-900/50 text-red-300 transition-colors"
                          title="Excluir serviço"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA: GERENCIADOR DE CARROSSEL */}
            {adminTab === 'banners' && (
              <div className="bg-[#161F2E]/80 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-6">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    Gerenciador de Banners Promocionais (Carrossel)
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Adicione ou remova os slides que aparecem no topo da tela do cliente.
                  </p>
                </div>

                {/* Formulário Novo Banner */}
                <form onSubmit={handleAddBanner} className="p-4 bg-[#0E1522] border border-white/10 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    + Adicionar Novo Banner Promocional
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Título Principal (Ex: 🔥 30% OFF nesta Terça)"
                      value={newBannerTitle}
                      onChange={(e) => setNewBannerTitle(e.target.value)}
                      className="bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Subtítulo Descritivo"
                      value={newBannerSubtitle}
                      onChange={(e) => setNewBannerSubtitle(e.target.value)}
                      className="bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="URL da Imagem de Fundo (ou deixe vazio para padrão)"
                      value={newBannerImage}
                      onChange={(e) => setNewBannerImage(e.target.value)}
                      className="bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tag (Ex: Destaque da Semana)"
                        value={newBannerTag}
                        onChange={(e) => setNewBannerTag(e.target.value)}
                        className="flex-1 bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Criar Banner
                      </button>
                    </div>
                  </div>
                </form>

                {/* Lista de Banners Atuais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {banners.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-[#0E1522] border border-white/10 rounded-2xl flex flex-col justify-between overflow-hidden relative"
                    >
                      <div className="h-24 w-full rounded-xl overflow-hidden mb-2 relative">
                        <img
                          src={b.image}
                          alt={b.title}
                          className="w-full h-full object-cover brightness-60"
                        />
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase bg-amber-500 text-black px-2 py-0.5 rounded">
                          {b.tag}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">{b.title}</h5>
                        <p className="text-[11px] text-gray-400 line-clamp-1">{b.subtitle}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/5 flex justify-end">
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir Banner
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA: GERENCIADOR DE EQUIPE DE BARBEIROS */}
            {adminTab === 'team' && (
              <div className="bg-[#161F2E]/80 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      Gerenciamento da Equipe & Cadeiras Ativas
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Cada profissional cadastrado tem sua própria agenda. A mensalidade do SaaS se ajusta dinamicamente.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-amber-400 font-bold font-mono">
                      {barbers.length} Barbeiro(s) = R$ {currentMonthlyFee},00/mês
                    </span>
                  </div>
                </div>

                {/* Formulário Novo Barbeiro com Foto da Galeria e Comissão Opcional */}
                <form onSubmit={handleAddBarber} className="p-4 bg-[#0E1522] border border-white/10 rounded-2xl space-y-3.5">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    + Cadastrar Novo Barbeiro na Equipe
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-amber-400 mb-1">
                        Nome do Barbeiro
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Rafael Santos"
                        value={newBarberName}
                        onChange={(e) => setNewBarberName(e.target.value)}
                        className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-amber-400 mb-1">
                        Especialidade
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Barboterapia & Visagismo"
                        value={newBarberSpecialty}
                        onChange={(e) => setNewBarberSpecialty(e.target.value)}
                        className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        Comissão (%) <span className="text-gray-500 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 50 (opcional)"
                        value={newBarberCommission}
                        onChange={(e) => setNewBarberCommission(e.target.value)}
                        className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Upload de Foto da Galeria do Dispositivo */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-amber-400 mb-1.5">
                      Foto do Barbeiro (Galeria do Celular / Computador)
                    </label>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0B0F17] border border-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        {newBarberAvatar ? (
                          <img
                            src={newBarberAvatar}
                            alt="Preview Barbeiro"
                            className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#161F2E] border-2 border-dashed border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all active:scale-95">
                            <Upload className="w-4 h-4 stroke-[2.5]" />
                            <span>{newBarberAvatar ? 'Alterar Foto da Galeria' : 'Escolher Foto da Galeria'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleBarberPhotoUpload}
                              onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                              className="hidden"
                            />
                          </label>
                          {newBarberAvatar && (
                            <button
                              type="button"
                              onClick={() => setNewBarberAvatar('')}
                              className="text-xs text-gray-400 hover:text-red-400 underline px-1"
                            >
                              Remover foto
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {newBarberAvatar ? '✅ Foto carregada da sua galeria!' : 'Toque para selecionar imagem do seu aparelho.'}
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 min-h-[42px]"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" /> Cadastrar Barbeiro
                      </button>
                    </div>
                  </div>
                </form>

                {/* Lista da Equipe com Foto da Galeria e Exclusão Desbloqueada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {barbers.length === 0 ? (
                    <div className="col-span-full p-6 text-center text-xs text-gray-400 bg-[#0E1522] rounded-2xl border border-white/5">
                      Nenhum profissional cadastrado na equipe. Adicione os barbeiros no formulário acima.
                    </div>
                  ) : (
                    barbers.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 bg-[#0E1522] border border-white/10 rounded-2xl flex flex-col justify-between gap-3 shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {b.avatar ? (
                              <img
                                src={b.avatar}
                                alt={b.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50 shrink-0 shadow-md"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/40 border-2 border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-sm shadow-md shrink-0">
                                {getInitials(b.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-extrabold text-sm text-white truncate">{b.name}</p>
                              <p className="text-[11px] text-gray-400 truncate">{b.specialty}</p>
                              {b.commission !== undefined && b.commission > 0 ? (
                                <span className="text-[10px] text-amber-400 font-mono font-semibold block">
                                  Comissão: {b.commission}%
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-500 font-mono block">
                                  Sem comissão (opcional)
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteBarber(b.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 border border-red-900/50 text-red-300 text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                            title="Excluir este barbeiro da equipe"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>

                        {/* Botão de Trocar Foto da Galeria para este Barbeiro */}
                        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[11px] text-gray-400">Foto do profissional:</span>
                          <div className="flex items-center gap-2">
                            {b.avatar && (
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingBarberPhoto(b.id)}
                                className="text-[11px] text-gray-400 hover:text-red-400 underline transition-colors"
                              >
                                Tirar Foto
                              </button>
                            )}
                            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161F2E] hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 text-amber-300 text-xs font-bold transition-all active:scale-95">
                              <Camera className="w-3.5 h-3.5 text-amber-400" />
                              <span>Mudar Foto (Galeria)</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleExistingBarberPhotoUpload(b.id, file);
                                }}
                                onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ABA: CALCULADORA E COBRANÇA DA MENSALIDADE SAAS */}
            {adminTab === 'saas' && (
              <div className="bg-[#161F2E]/80 border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      Assinatura SaaS da Barbearia (Cobrança Progressiva)
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Transparência total: pague somente pelo número de cadeiras/barbeiros em operação.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 15 Dias Grátis Ativos
                  </span>
                </div>

                {/* Box de Cálculo & QR Code Pix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-[#0E1522] p-4 sm:p-6 rounded-2xl border border-white/10">
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                      Detalhamento do Cálculo Automático
                    </span>

                    <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-white/5">
                      <span className="text-gray-400">Barbeiros ativos cadastrados:</span>
                      <strong className="text-white font-mono">{barbers.length} profissional(is)</strong>
                    </div>

                    <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-white/5">
                      <span className="text-gray-400">1º Barbeiro (Plano Base):</span>
                      <span className="text-gray-200 font-mono">R$ 100,00</span>
                    </div>

                    {barbers.length === 2 && (
                      <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-white/5">
                        <span className="text-gray-400">2º Barbeiro adicional:</span>
                        <span className="text-gray-200 font-mono">+ R$ 90,00</span>
                      </div>
                    )}

                    {barbers.length === 3 && (
                      <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-white/5">
                        <span className="text-gray-400">2º e 3º Barbeiros adicionais:</span>
                        <span className="text-gray-200 font-mono">+ R$ 170,00</span>
                      </div>
                    )}

                    {barbers.length > 3 && (
                      <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-white/5">
                        <span className="text-gray-400">Base trio + {barbers.length - 3} extras (R$ 80/cada):</span>
                        <span className="text-gray-200 font-mono">R$ 270 + R$ {(barbers.length - 3) * 80},00</span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs sm:text-sm py-1 border-b border-white/5">
                      <span className="text-gray-400">Custo médio por barbeiro:</span>
                      <span className="text-amber-400 font-bold font-mono">
                        R$ {(currentMonthlyFee / barbers.length).toFixed(2)} / mês
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">Mensalidade Total:</span>
                      <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums">
                        R$ {currentMonthlyFee},00
                      </span>
                    </div>
                  </div>

                  {/* QR Code Pix */}
                  <div className="flex flex-col items-center justify-center p-4 bg-[#161F2E] rounded-xl border border-white/10 text-center space-y-3">
                    <span className="text-xs font-bold text-gray-300">Pagamento da Mensalidade via Pix</span>
                    <PixQrVisual value={saasPixKey} size={150} label="SAAS-MENSAL" />
                    <p className="text-[11px] text-gray-400">
                      Escaneie com o app do seu banco para pagar R$ {currentMonthlyFee},00
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(saasPixKey);
                        setToastMsg('Código Pix Copia e Cola copiado com sucesso!');
                        setTimeout(() => setToastMsg(null), 3000);
                      }}
                      className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Pix Copia e Cola
                    </button>
                  </div>
                </div>

                {/* Tabela de Regras */}
                <div className="p-4 bg-[#0E1522] rounded-2xl border border-white/10 text-xs text-gray-300 space-y-1.5">
                  <span className="font-bold text-amber-400 block mb-1">
                    📋 Tabela Oficial de Planos SaaS Barber:
                  </span>
                  <p>• <strong>1 Barbeiro:</strong> R$ 100,00 fixo</p>
                  <p>• <strong>2 Barbeiros:</strong> R$ 190,00 (R$ 95,00 por barbeiro)</p>
                  <p>• <strong>3 Barbeiros:</strong> R$ 270,00 (R$ 90,00 por barbeiro)</p>
                  <p>• <strong>4+ Barbeiros:</strong> R$ 270,00 + R$ 80,00 por profissional extra</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL DE LOGIN RESTRITO DO BARBEIRO ================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#161F2E] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-white">Acesso do Barbeiro</h3>
              <p className="text-xs text-gray-400 mt-1">
                Área exclusiva para administração e gestão de cortes
              </p>
            </div>

            {loginError && (
              <div className="p-2.5 mb-3 bg-red-950/60 border border-red-900/50 rounded-xl text-xs text-red-300 text-center font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Usuário</label>
                <input
                  type="text"
                  placeholder="admin"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Senha</label>
                <input
                  type="password"
                  placeholder="1234"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black py-3 rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  Entrar no Painel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginUser('admin');
                    setLoginPass('1234');
                  }}
                  className="w-full py-2 rounded-xl text-[11px] text-amber-400/80 hover:text-amber-300 font-semibold transition-colors"
                >
                  ⚡ Preencher credenciais de teste (admin / 1234)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL PIX DO CLIENTE ================= */}
      {showPixModal && latestAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#161F2E] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white text-center">
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              Pagamento Pix Imediato
            </span>

            <h3 className="text-lg font-black text-white mt-2">
              R$ {latestAppointment.price.toFixed(2)}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {latestAppointment.serviceName} com {latestAppointment.barberName}
            </p>

            <div className="my-4 flex justify-center">
              <PixQrVisual
                value={generatePixCopiaECola(
                  '12345678000199',
                  shopName.slice(0, 20),
                  'RIO DE JANEIRO',
                  latestAppointment.price
                )}
                size={160}
                label="PIX-CLIENTE"
              />
            </div>

            <p className="text-xs text-gray-300 mb-3">
              Abra o app do seu banco, escolha <strong>Pix Copia e Cola</strong> ou aponte a câmera para o QR Code.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    generatePixCopiaECola(
                      '12345678000199',
                      shopName.slice(0, 20),
                      'RIO DE JANEIRO',
                      latestAppointment.price
                    )
                  );
                  setToastMsg('Código Pix copiado para a área de transferência!');
                  setTimeout(() => setToastMsg(null), 3000);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar Código Pix
              </button>

              <button
                onClick={() => setShowPixModal(false)}
                className="w-full py-2 rounded-xl bg-[#0B0F17] hover:bg-black text-gray-300 text-xs font-semibold border border-white/10"
              >
                Já Efetuei o Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAVIGATION BAR (THUMB ZONE MOBILE) ================= */}
      <nav
        aria-label="Navegação Rápida"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0E1522]/95 backdrop-blur-lg border-t border-white/10 md:hidden px-3 py-2 flex items-center justify-around shadow-2xl pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        {viewMode === 'client' ? (
          <>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center justify-center py-1 px-3 text-amber-400 font-bold min-h-[46px]"
            >
              <Scissors className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Agendar</span>
            </button>

            <button
              onClick={handleInstallPWA}
              className="flex flex-col items-center justify-center py-1 px-3 text-gray-400 hover:text-white min-h-[46px]"
            >
              <Download className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">App PWA</span>
            </button>

            <button
              onClick={handleOpenLogin}
              className="flex flex-col items-center justify-center py-1 px-3 text-gray-400 hover:text-amber-400 min-h-[46px]"
            >
              <Lock className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">Barbeiro</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setAdminTab('overview')}
              className={`flex flex-col items-center justify-center py-1 px-2 min-h-[46px] ${
                adminTab === 'overview' ? 'text-amber-400 font-bold' : 'text-gray-400'
              }`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Fila</span>
            </button>

            <button
              onClick={() => setAdminTab('services')}
              className={`flex flex-col items-center justify-center py-1 px-2 min-h-[46px] ${
                adminTab === 'services' ? 'text-amber-400 font-bold' : 'text-gray-400'
              }`}
            >
              <Scissors className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Preços</span>
            </button>

            <button
              onClick={() => setAdminTab('team')}
              className={`flex flex-col items-center justify-center py-1 px-2 min-h-[46px] ${
                adminTab === 'team' ? 'text-amber-400 font-bold' : 'text-gray-400'
              }`}
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Equipe</span>
            </button>

            <button
              onClick={() => setAdminTab('saas')}
              className={`flex flex-col items-center justify-center py-1 px-2 min-h-[46px] ${
                adminTab === 'saas' ? 'text-amber-400 font-bold' : 'text-gray-400'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">SaaS</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-1 px-2 text-red-400 min-h-[46px]"
            >
              <LogOut className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Sair</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
