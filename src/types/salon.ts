export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  notes?: string;
}

export interface SalonSettings {
  maxAppointmentsPerDay: number;
  slotIntervalMinutes: number; // e.g. 30
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  advanceBookingDays: number; // 30
  autoBlockFullDates: boolean;
  requirePaymentReceipt: boolean;
  allowCashOnArrival: boolean;
}

export interface SalonHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  apiKeyConfigured: boolean;
  senderPhoneNumber: string;
  reminderHoursBefore: number;
}

export interface SalonAdvertisement {
  enabled: boolean;
  type: 'video' | 'image';
  mediaUrl: string; // Video URL (MP4/WebM) or Image URL (JPG/PNG)
  title?: string; // e.g. "Special 20% OFF Keratin Infusion"
  description?: string; // e.g. "Valid on weekdays for appointments booked via QR"
  badge?: string; // e.g. "PROMO" / "SPECIAL OFFER"
  linkUrl?: string; // optional link or action
  autoplay?: boolean;
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  instagram?: string;
  currency: string;
  bankDetails: BankDetails;
  settings: SalonSettings;
  holidays: SalonHoliday[];
  weeklyClosedDays: number[]; // 0=Sunday, 1=Monday, etc.
  whatsappConfig: WhatsAppConfig;
  advertisement?: SalonAdvertisement;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  description: string;
  active: boolean;
  badge?: string;
  imageUrl?: string; // Optional JPG / image
  videoUrl?: string; // Optional Video clip (MP4, WebM, video link)
}

export interface Staff {
  id: string;
  salonId: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  availableDays: number[]; // 0=Sun .. 6=Sat
  specialties: string[];
  active: boolean;
}

export type AppointmentStatus = 'pending_verification' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending_review' | 'approved' | 'rejected';
export type PaymentMethod = 'bank_transfer' | 'cash_on_arrival';

export interface Appointment {
  id: string;
  refCode: string; // e.g. WCS-8921
  salonId: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string;
  customerNotes?: string;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  staffId: string; // 'any' or specific staff ID
  staffName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  amount: number;
  currency: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  receiptUrl?: string;
  receiptRefNumber?: string;
  receiptUploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  whatsappConfirmationSent: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  salonId: string;
  name: string;
  whatsapp: string;
  email?: string;
  appointmentCount: number;
  totalSpent: number;
  lastVisited: string;
  notes?: string;
}

export interface WhatsAppMessageLog {
  id: string;
  salonId: string;
  recipientPhone: string;
  recipientName: string;
  appointmentRef: string;
  type: 'booking_received' | 'payment_confirmed' | 'reminder_24h' | 'cancelled';
  messageText: string;
  timestamp: string;
  status: 'delivered' | 'sent';
}

export interface WebhookEventLog {
  id: string;
  salonId: string;
  eventType: 'messages.status' | 'messages.received' | 'webhook.verify' | 'ping';
  status: 'success' | 'warning' | 'error';
  httpStatus: number;
  latencyMs: number;
  payloadSummary: string;
  rawPayload?: Record<string, unknown>;
  timestamp: string;
}

export interface ApiIntegrationHealthData {
  connectionStatus: 'connected' | 'degraded' | 'disconnected';
  lastPingTimestamp: string;
  lastPingLatencyMs: number;
  totalWebhooksReceived: number;
  successfulEvents: number;
  failedEvents: number;
  http4xxErrors: number;
  http5xxErrors: number;
  uptimePercentage: number;
  webhookUrl: string;
  verifyToken: string;
  sslActive: boolean;
  events: WebhookEventLog[];
}
