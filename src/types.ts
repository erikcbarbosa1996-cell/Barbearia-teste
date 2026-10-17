export type Barber = {
  id: string;
  name: string;
  commission?: number; // percentage, optional (e.g. 50 or undefined)
  avatar?: string; // base64 or url from device gallery
  role?: string;
  specialty?: string;
  phone?: string;
  available?: boolean;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
  category?: 'corte' | 'barba' | 'combo' | 'quimica';
};

export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export type PaymentMethod = 'Pix Online' | 'Pix Local' | 'Dinheiro Local' | 'Cartão Local';

export type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  barberName: string;
  serviceName: string;
  price: number;
  date?: string;
  time: string;
  paymentMethod: PaymentMethod;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
};

export type ShopConfig = {
  name: string;
  phone: string;
  address: string;
  bannerText: string;
  primaryColor: string;
};

export type GalleryComment = {
  id: string;
  authorName: string;
  text: string;
  isBarberReply?: boolean;
  createdAt: string;
};

export type GalleryPost = {
  id: string;
  imageUrl: string;
  caption: string;
  authorName: string;
  isBarberPost?: boolean;
  barberName: string;
  likes: number;
  likedByMe?: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  comments: GalleryComment[];
};
