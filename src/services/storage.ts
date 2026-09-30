import {
  Salon,
  Service,
  Staff,
  Appointment,
  Customer,
  WhatsAppMessageLog,
  ApiIntegrationHealthData,
  WebhookEventLog,
} from '../types/salon';

const LUXE_HERO = '/src/assets/images/salon_hero_luxehair_1790706239593.jpg';
const AURA_HERO = '/src/assets/images/salon_hero_auraspa_1790706254828.jpg';
const STAFF_LEAD = '/src/assets/images/salon_staff_lead_1790706266061.jpg';

export const INITIAL_SALONS: Salon[] = [
  {
    id: 'salon_abc',
    name: 'ABC Beauty Salon',
    slug: 'abc-beauty',
    tagline: 'Premier Hair, Skin & Bridal Aesthetics in Colombo',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80',
    coverImageUrl: LUXE_HERO,
    rating: 4.9,
    reviewCount: 384,
    address: 'No. 42, Galle Road, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 254 8890',
    whatsapp: '+94 77 123 4567',
    currency: 'Rs.',
    bankDetails: {
      accountName: 'ABC Beauty Salon (Pvt) Ltd',
      bankName: 'Commercial Bank of Ceylon',
      accountNumber: '8004921045',
      branch: 'Kollupitiya Branch',
      notes: 'Please attach transfer slip or reference number during booking checkout.',
    },
    settings: {
      maxAppointmentsPerDay: 20,
      slotIntervalMinutes: 30,
      openTime: '09:00',
      closeTime: '18:00',
      advanceBookingDays: 30,
      autoBlockFullDates: true,
      requirePaymentReceipt: true,
      allowCashOnArrival: true,
    },
    holidays: [
      { id: 'hol_1', date: '2026-10-05', title: 'Vap Full Moon Poya Day' },
      { id: 'hol_2', date: '2026-10-18', title: 'Salon Deep Clean & Renovation' },
    ],
    weeklyClosedDays: [0], // Closed on Sundays
    whatsappConfig: {
      enabled: true,
      phoneNumberId: '10984920491823',
      businessAccountId: 'WABA_COLOMBO_ABC_01',
      apiKeyConfigured: true,
      senderPhoneNumber: '+94 77 123 4567',
      reminderHoursBefore: 24,
    },
    advertisement: {
      enabled: true,
      type: 'video',
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      title: 'Keratin & Glow Spa Special',
      description: 'Get 20% OFF on all Keratin & Facial treatments this month!',
      badge: 'SPECIAL 20% OFF',
      autoplay: true,
    },
  },
  {
    id: 'salon_luxe',
    name: 'Luxe Hair & Studio Lounge',
    slug: 'luxe-hair-studio',
    tagline: 'High-Fashion Balayage, Precision Cuts & Luxury Treatments',
    logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80',
    coverImageUrl: LUXE_HERO,
    rating: 4.95,
    reviewCount: 512,
    address: 'Level 2, Cinnamon Grand Arcade, Colombo 03',
    city: 'Colombo',
    phone: '+94 11 298 3311',
    whatsapp: '+94 71 889 0022',
    currency: 'Rs.',
    bankDetails: {
      accountName: 'Luxe Studio Colombo',
      bankName: 'Sampath Bank PLC',
      accountNumber: '009210034821',
      branch: 'Colombo City Branch',
      notes: 'Include your Name & Appointment Ref in transfer narration.',
    },
    settings: {
      maxAppointmentsPerDay: 24,
      slotIntervalMinutes: 30,
      openTime: '09:00',
      closeTime: '19:00',
      advanceBookingDays: 45,
      autoBlockFullDates: true,
      requirePaymentReceipt: true,
      allowCashOnArrival: false,
    },
    holidays: [
      { id: 'hol_3', date: '2026-10-05', title: 'Poya Day' },
    ],
    weeklyClosedDays: [],
    whatsappConfig: {
      enabled: true,
      phoneNumberId: '10984920491824',
      businessAccountId: 'WABA_LUXE_02',
      apiKeyConfigured: true,
      senderPhoneNumber: '+94 71 889 0022',
      reminderHoursBefore: 24,
    },
  },
  {
    id: 'salon_aura',
    name: 'Aura Botanical Spa & Salon',
    slug: 'aura-spa',
    tagline: 'Holistic Ayurvedic Botanicals, Organic Facials & Body Rituals',
    logoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=80',
    coverImageUrl: AURA_HERO,
    rating: 4.88,
    reviewCount: 220,
    address: '15 Gregory’s Road, Colombo 07',
    city: 'Colombo 07',
    phone: '+94 11 772 1100',
    whatsapp: '+94 76 554 9900',
    currency: 'Rs.',
    bankDetails: {
      accountName: 'Aura Wellness Group',
      bankName: 'Hatton National Bank',
      accountNumber: '108829304910',
      branch: 'Green Path Branch',
      notes: 'Upload deposit slip before your visit to ensure slot priority.',
    },
    settings: {
      maxAppointmentsPerDay: 16,
      slotIntervalMinutes: 45,
      openTime: '10:00',
      closeTime: '19:00',
      advanceBookingDays: 30,
      autoBlockFullDates: true,
      requirePaymentReceipt: true,
      allowCashOnArrival: true,
    },
    holidays: [],
    weeklyClosedDays: [1], // Closed Mondays
    whatsappConfig: {
      enabled: true,
      phoneNumberId: '10984920491825',
      businessAccountId: 'WABA_AURA_03',
      apiKeyConfigured: true,
      senderPhoneNumber: '+94 76 554 9900',
      reminderHoursBefore: 24,
    },
  },
];

export const INITIAL_SERVICES: Service[] = [
  // ABC Beauty Salon services
  {
    id: 'srv_1',
    salonId: 'salon_abc',
    name: 'Hair Cut & Styling',
    category: 'Hair',
    durationMinutes: 30,
    price: 1500,
    description: 'Precision cut tailored to your face structure, wash with keratin infusion and blowout style.',
    active: true,
    badge: 'Popular',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'srv_2',
    salonId: 'salon_abc',
    name: 'Hair Wash & Blowdry',
    category: 'Hair',
    durationMinutes: 30,
    price: 1000,
    description: 'Invigorating scalp wash with luxury herbal shampoo, conditioning rinse and sleek finish.',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'srv_3',
    salonId: 'salon_abc',
    name: 'Brightening Herbal Facial',
    category: 'Skin & Facial',
    durationMinutes: 60,
    price: 3000,
    description: 'Deep pore purification, steam extraction, vitamin C massage and cooling aloe mask.',
    active: true,
    badge: 'Trending',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'srv_4',
    salonId: 'salon_abc',
    name: 'Full Hair Colour & Gloss',
    category: 'Hair',
    durationMinutes: 120,
    price: 5000,
    description: 'Ammonia-free organic permanent colour or rich gloss treatment with vibrant shine.',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'srv_5',
    salonId: 'salon_abc',
    name: 'Bridal Makeup & Dressing',
    category: 'Bridal',
    durationMinutes: 180,
    price: 15000,
    description: 'Signature bridal transformation, HD contouring, jewellery setting and saree drapery.',
    active: true,
    badge: 'Exclusive',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  },
  {
    id: 'srv_6',
    salonId: 'salon_abc',
    name: 'Deluxe Manicure & Gel Polish',
    category: 'Nails',
    durationMinutes: 45,
    price: 2200,
    description: 'Cuticle revival, dead sea salt scrub, hand massage and chip-resistant LED gel coating.',
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80',
  },

  // Luxe Hair Studio services
  {
    id: 'srv_101',
    salonId: 'salon_luxe',
    name: 'Couture Haircut & Scalp Detox',
    category: 'Hair',
    durationMinutes: 45,
    price: 2500,
    description: 'Consultation with master stylist, detox clarifying scalp treatment and signature blowout.',
    active: true,
    badge: 'Best Seller',
  },
  {
    id: 'srv_102',
    salonId: 'salon_luxe',
    name: 'French Balayage & Olaplex',
    category: 'Hair',
    durationMinutes: 150,
    price: 8500,
    description: 'Freehand dimensional sun-kissed lightening with complete Olaplex bond repair therapy.',
    active: true,
    badge: 'Signature',
  },
  {
    id: 'srv_103',
    salonId: 'salon_luxe',
    name: 'Brazilian Keratin Smoothing',
    category: 'Hair',
    durationMinutes: 120,
    price: 9000,
    description: 'Long-lasting frizz elimination and mirror-like glossy softness for up to 4 months.',
    active: true,
  },

  // Aura Spa services
  {
    id: 'srv_201',
    salonId: 'salon_aura',
    name: 'Ayurvedic Botanical Full Body Therapy',
    category: 'Spa & Wellness',
    durationMinutes: 60,
    price: 4500,
    description: 'Warm medicinal herbal oil synchronization, acupressure relaxation and steam tent.',
    active: true,
    badge: 'Signature',
  },
  {
    id: 'srv_202',
    salonId: 'salon_aura',
    name: 'Organic Radiance Facial',
    category: 'Skin & Facial',
    durationMinutes: 45,
    price: 3500,
    description: 'Cold-pressed moringa oil scrub, rosewater mist and anti-aging jade stone rolling.',
    active: true,
  },
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf_kamal',
    salonId: 'salon_abc',
    name: 'Kamal Silva',
    role: 'Senior Hair Stylist',
    avatar: STAFF_LEAD,
    rating: 4.95,
    availableDays: [1, 2, 3, 4, 5, 6],
    specialties: ['Hair Cut', 'Hair Wash', 'Hair Colour'],
    active: true,
  },
  {
    id: 'stf_nimal',
    salonId: 'salon_abc',
    name: 'Nimal Perera',
    role: 'Skin & Facial Specialist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 4.9,
    availableDays: [1, 2, 3, 4, 5, 6],
    specialties: ['Facial', 'Manicure', 'Hair Wash'],
    active: true,
  },
  {
    id: 'stf_sanduni',
    salonId: 'salon_abc',
    name: 'Sanduni Wickramasinghe',
    role: 'Bridal Artiste & Master Colourist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    rating: 4.98,
    availableDays: [1, 2, 3, 4, 5, 6],
    specialties: ['Bridal Makeup', 'Hair Colour', 'Facial'],
    active: true,
  },
  {
    id: 'stf_dilshan',
    salonId: 'salon_luxe',
    name: 'Dilshan Senanayake',
    role: 'Creative Director',
    avatar: STAFF_LEAD,
    rating: 5.0,
    availableDays: [1, 2, 3, 4, 5, 6],
    specialties: ['Couture Haircut', 'French Balayage', 'Keratin'],
    active: true,
  },
  {
    id: 'stf_chathuri',
    salonId: 'salon_aura',
    name: 'Dr. Chathuri Alwis',
    role: 'Holistic Therapist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 4.95,
    availableDays: [2, 3, 4, 5, 6, 0],
    specialties: ['Ayurvedic Therapy', 'Organic Facial'],
    active: true,
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cst_1',
    salonId: 'salon_abc',
    name: 'Kamal Perera',
    whatsapp: '+94 77 123 4567',
    email: 'kamal.perera@example.com',
    appointmentCount: 12,
    totalSpent: 28500,
    lastVisited: '2026-09-29',
    notes: 'Prefers classic side taper. Sensitive scalp.',
  },
  {
    id: 'cst_2',
    salonId: 'salon_abc',
    name: 'Nimal Jayasuriya',
    whatsapp: '+94 71 456 7890',
    email: 'nimal.j@example.com',
    appointmentCount: 5,
    totalSpent: 15000,
    lastVisited: '2026-09-29',
    notes: 'Regular herbal facial client.',
  },
  {
    id: 'cst_3',
    salonId: 'salon_abc',
    name: 'Sanduni Fernando',
    whatsapp: '+94 76 998 1122',
    appointmentCount: 3,
    totalSpent: 12000,
    lastVisited: '2026-09-28',
    notes: 'Color retouching every 6 weeks.',
  },
  {
    id: 'cst_4',
    salonId: 'salon_abc',
    name: 'Kavindi Bandara',
    whatsapp: '+94 77 334 5566',
    appointmentCount: 1,
    totalSpent: 15000,
    lastVisited: '2026-09-25',
    notes: 'Bridal consultation completed.',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  // Today's appointments (2026-09-29) matching the exact specification from brief:
  // 09:00 Kamal Hair Cut Confirmed
  {
    id: 'apt_101',
    refCode: 'WCS-8921',
    salonId: 'salon_abc',
    customerId: 'cst_1',
    customerName: 'Kamal Perera',
    customerWhatsapp: '+94 77 123 4567',
    customerNotes: 'Please ensure styling wax finish.',
    serviceId: 'srv_1',
    serviceName: 'Hair Cut & Styling',
    serviceDuration: 30,
    staffId: 'stf_kamal',
    staffName: 'Kamal Silva',
    date: '2026-09-29',
    startTime: '09:00',
    endTime: '09:30',
    amount: 1500,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'bank_transfer',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    receiptRefNumber: 'TXN-902148',
    receiptUploadedAt: '2026-09-28 16:30',
    verifiedBy: 'Salon Manager',
    verifiedAt: '2026-09-28 17:00',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-28 16:20',
  },
  // 09:30 Nimal Facial Confirmed
  {
    id: 'apt_102',
    refCode: 'WCS-8922',
    salonId: 'salon_abc',
    customerId: 'cst_2',
    customerName: 'Nimal Jayasuriya',
    customerWhatsapp: '+94 71 456 7890',
    serviceId: 'srv_3',
    serviceName: 'Brightening Herbal Facial',
    serviceDuration: 60,
    staffId: 'stf_nimal',
    staffName: 'Nimal Perera',
    date: '2026-09-29',
    startTime: '09:30',
    endTime: '10:30',
    amount: 3000,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'bank_transfer',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    receiptRefNumber: 'COMM-89104',
    receiptUploadedAt: '2026-09-28 18:00',
    verifiedBy: 'Salon Manager',
    verifiedAt: '2026-09-28 18:40',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-28 17:50',
  },
  // 10:30 Sanduni Hair Colour Pending Review (as requested in Section 11 & 16 of brief!)
  {
    id: 'apt_103',
    refCode: 'WCS-8923',
    salonId: 'salon_abc',
    customerId: 'cst_3',
    customerName: 'Sanduni Fernando',
    customerWhatsapp: '+94 76 998 1122',
    customerNotes: 'Ash brown highlights test done last month.',
    serviceId: 'srv_4',
    serviceName: 'Full Hair Colour & Gloss',
    serviceDuration: 120,
    staffId: 'stf_sanduni',
    staffName: 'Sanduni Wickramasinghe',
    date: '2026-09-29',
    startTime: '10:30',
    endTime: '12:30',
    amount: 5000,
    currency: 'Rs.',
    status: 'pending_verification',
    paymentStatus: 'pending_review',
    paymentMethod: 'bank_transfer',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    receiptRefNumber: 'SAMPATH-884102',
    receiptUploadedAt: '2026-09-29 08:15',
    whatsappConfirmationSent: false,
    createdAt: '2026-09-29 08:10',
  },
  // Additional appointments for today to show realistic 14 / 20 capacity
  {
    id: 'apt_104',
    refCode: 'WCS-8924',
    salonId: 'salon_abc',
    customerId: 'cst_4',
    customerName: 'Kavindi Bandara',
    customerWhatsapp: '+94 77 334 5566',
    serviceId: 'srv_5',
    serviceName: 'Bridal Makeup & Dressing',
    serviceDuration: 180,
    staffId: 'stf_sanduni',
    staffName: 'Sanduni Wickramasinghe',
    date: '2026-09-29',
    startTime: '13:00',
    endTime: '16:00',
    amount: 15000,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'bank_transfer',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    receiptRefNumber: 'HNB-990142',
    receiptUploadedAt: '2026-09-27 10:00',
    verifiedBy: 'Salon Manager',
    verifiedAt: '2026-09-27 10:30',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-27 09:45',
  },
  {
    id: 'apt_105',
    refCode: 'WCS-8925',
    salonId: 'salon_abc',
    customerId: 'cst_5',
    customerName: 'Anuki De Silva',
    customerWhatsapp: '+94 70 223 8899',
    serviceId: 'srv_6',
    serviceName: 'Deluxe Manicure & Gel Polish',
    serviceDuration: 45,
    staffId: 'stf_nimal',
    staffName: 'Nimal Perera',
    date: '2026-09-29',
    startTime: '11:00',
    endTime: '11:45',
    amount: 2200,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'cash_on_arrival',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-29 08:30',
  },

  // Tomorrow's appointments (2026-09-30) matching section 5 in user prompt:
  // 09:30 booked, 10:30 booked, 11:30 booked
  {
    id: 'apt_201',
    refCode: 'WCS-8931',
    salonId: 'salon_abc',
    customerId: 'cst_1',
    customerName: 'Dinesh Rathnayake',
    customerWhatsapp: '+94 77 990 0112',
    serviceId: 'srv_1',
    serviceName: 'Hair Cut & Styling',
    serviceDuration: 30,
    staffId: 'stf_kamal',
    staffName: 'Kamal Silva',
    date: '2026-09-30',
    startTime: '09:30',
    endTime: '10:00',
    amount: 1500,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'bank_transfer',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    receiptRefNumber: 'TXN-909981',
    receiptUploadedAt: '2026-09-28 14:00',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-28 13:50',
  },
  {
    id: 'apt_202',
    refCode: 'WCS-8932',
    salonId: 'salon_abc',
    customerId: 'cst_2',
    customerName: 'Tharindu Fernando',
    customerWhatsapp: '+94 71 881 2233',
    serviceId: 'srv_1',
    serviceName: 'Hair Cut & Styling',
    serviceDuration: 30,
    staffId: 'stf_kamal',
    staffName: 'Kamal Silva',
    date: '2026-09-30',
    startTime: '10:30',
    endTime: '11:00',
    amount: 1500,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'bank_transfer',
    receiptRefNumber: 'TXN-909982',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-28 14:20',
  },
  {
    id: 'apt_203',
    refCode: 'WCS-8933',
    salonId: 'salon_abc',
    customerId: 'cst_3',
    customerName: 'Malith Gunawardena',
    customerWhatsapp: '+94 77 441 5566',
    serviceId: 'srv_2',
    serviceName: 'Hair Wash & Blowdry',
    serviceDuration: 30,
    staffId: 'stf_kamal',
    staffName: 'Kamal Silva',
    date: '2026-09-30',
    startTime: '11:30',
    endTime: '12:00',
    amount: 1000,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'bank_transfer',
    receiptRefNumber: 'TXN-909983',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-28 15:00',
  },
];

// Pre-fill a sample fully booked day on 2026-10-02 (20 appointments) to demonstrate the automated daily capacity limit engine
const FULL_DATE = '2026-10-02';
for (let i = 0; i < 20; i++) {
  const hour = 9 + Math.floor(i / 2);
  const min = (i % 2) * 30;
  const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
  INITIAL_APPOINTMENTS.push({
    id: `apt_full_${i}`,
    refCode: `WCS-F${1000 + i}`,
    salonId: 'salon_abc',
    customerId: `cst_seed_${i}`,
    customerName: `Booked Guest ${i + 1}`,
    customerWhatsapp: `+94 77 000 ${1000 + i}`,
    serviceId: 'srv_1',
    serviceName: 'Hair Cut & Styling',
    serviceDuration: 30,
    staffId: i % 2 === 0 ? 'stf_kamal' : 'stf_nimal',
    staffName: i % 2 === 0 ? 'Kamal Silva' : 'Nimal Perera',
    date: FULL_DATE,
    startTime: timeStr,
    endTime: `${hour.toString().padStart(2, '0')}:${(min + 30).toString().padStart(2, '0')}`,
    amount: 1500,
    currency: 'Rs.',
    status: 'confirmed',
    paymentStatus: 'approved',
    paymentMethod: 'bank_transfer',
    whatsappConfirmationSent: true,
    createdAt: '2026-09-25 10:00',
  });
}

export const INITIAL_LOGS: WhatsAppMessageLog[] = [
  {
    id: 'wa_1',
    salonId: 'salon_abc',
    recipientPhone: '+94 77 123 4567',
    recipientName: 'Kamal Perera',
    appointmentRef: 'WCS-8921',
    type: 'payment_confirmed',
    messageText: `Hello Kamal,\n\nYour salon appointment has been confirmed! ✨\n\nSalon: ABC Beauty Salon\nService: Hair Cut & Styling\nSpecialist: Kamal Silva\nDate: 29 September 2026\nTime: 09:00 AM\nAmount: Rs. 1,500\nPayment: Confirmed (Ref: TXN-902148)\n\nThank you for choosing ABC Beauty Salon. Please arrive 5 minutes early.`,
    timestamp: '2026-09-28 17:00',
    status: 'delivered',
  },
  {
    id: 'wa_2',
    salonId: 'salon_abc',
    recipientPhone: '+94 71 456 7890',
    recipientName: 'Nimal Jayasuriya',
    appointmentRef: 'WCS-8922',
    type: 'payment_confirmed',
    messageText: `Hello Nimal,\n\nYour salon appointment has been confirmed! ✨\n\nSalon: ABC Beauty Salon\nService: Brightening Herbal Facial\nSpecialist: Nimal Perera\nDate: 29 September 2026\nTime: 09:30 AM\nAmount: Rs. 3,000\nPayment: Confirmed\n\nThank you for choosing ABC Beauty Salon.`,
    timestamp: '2026-09-28 18:40',
    status: 'delivered',
  },
];

export const INITIAL_API_HEALTH: Record<string, ApiIntegrationHealthData> = {
  salon_abc: {
    connectionStatus: 'connected',
    lastPingTimestamp: '2026-09-29 11:46:12',
    lastPingLatencyMs: 74,
    totalWebhooksReceived: 142,
    successfulEvents: 139,
    failedEvents: 3,
    http4xxErrors: 2,
    http5xxErrors: 1,
    uptimePercentage: 99.8,
    webhookUrl: 'https://ais-dev-goz2t6xq5hs32ilxsi2npa-712673850908.asia-southeast1.run.app/api/webhooks/whatsapp',
    verifyToken: 'wcs_salon_token_88912',
    sslActive: true,
    events: [
      {
        id: 'evt_101',
        salonId: 'salon_abc',
        eventType: 'messages.status',
        status: 'success',
        httpStatus: 200,
        latencyMs: 68,
        payloadSummary: 'Message delivered to +94771234567 (Ref: WCS-8921)',
        timestamp: '2026-09-29 11:46:12',
        rawPayload: {
          object: 'whatsapp_business_account',
          entry: [
            {
              id: 'WABA_COLOMBO_ABC_01',
              changes: [
                {
                  value: {
                    messaging_product: 'whatsapp',
                    metadata: { display_phone_number: '+94771234567', phone_number_id: '10984920491823' },
                    statuses: [{ id: 'wamid.HBgLOTE3...4AA=', status: 'delivered', timestamp: '1790706372', recipient_id: '94771234567' }]
                  },
                  field: 'messages'
                }
              ]
            }
          ]
        }
      },
      {
        id: 'evt_102',
        salonId: 'salon_abc',
        eventType: 'ping',
        status: 'success',
        httpStatus: 200,
        latencyMs: 74,
        payloadSummary: 'Meta Graph API health ping: OK (v21.0)',
        timestamp: '2026-09-29 11:45:00',
        rawPayload: { status: 'healthy', node: 'asia-southeast1-b', timestamp: 1790706300 }
      },
      {
        id: 'evt_103',
        salonId: 'salon_abc',
        eventType: 'messages.status',
        status: 'success',
        httpStatus: 200,
        latencyMs: 82,
        payloadSummary: 'Message read by +94714567890 (Ref: WCS-8922)',
        timestamp: '2026-09-29 11:32:45',
        rawPayload: {
          statuses: [{ id: 'wamid.HBgLOTE3...8ZZ=', status: 'read', timestamp: '1790705565', recipient_id: '94714567890' }]
        }
      },
      {
        id: 'evt_104',
        salonId: 'salon_abc',
        eventType: 'messages.status',
        status: 'error',
        httpStatus: 429,
        latencyMs: 142,
        payloadSummary: 'Rate limit advisory from Meta API (transient)',
        timestamp: '2026-09-29 10:14:22',
        rawPayload: { error: { message: 'Message throughput quota reached', code: 131056, type: 'OAuthException' } }
      },
      {
        id: 'evt_105',
        salonId: 'salon_abc',
        eventType: 'webhook.verify',
        status: 'success',
        httpStatus: 200,
        latencyMs: 55,
        payloadSummary: 'Webhook subscription verification handshake (GET challenge acknowledged)',
        timestamp: '2026-09-29 09:00:00',
        rawPayload: { hub_mode: 'subscribe', hub_challenge: '1159384910' }
      }
    ]
  }
};

const STORAGE_KEYS = {
  SALONS: 'wcs_salons_v1',
  SERVICES: 'wcs_services_v1',
  STAFF: 'wcs_staff_v1',
  APPOINTMENTS: 'wcs_appointments_v1',
  CUSTOMERS: 'wcs_customers_v1',
  LOGS: 'wcs_whatsapp_logs_v1',
  ACTIVE_SALON_ID: 'wcs_active_salon_id_v1',
  API_HEALTH: 'wcs_api_health_v1',
  ADMIN_PASSWORD: 'wcs_admin_password_v1',
  ADMIN_PASSWORD_ENABLED: 'wcs_admin_password_enabled_v1',
  ADMIN_DEVICE_FLAG: 'wcs_admin_device_authenticated_v1',
};

// Dispatcher for cross-component reactive updates
export const DATA_CHANGE_EVENT = 'wcs_data_changed';
export function notifyDataChanged() {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT));
}

export const StorageService = {
  // Admin Device & Password Management
  getAdminPassword(): string {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || 'admin123';
  },

  setAdminPassword(newPassword: string): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
    notifyDataChanged();
  },

  isAdminPasswordRequired(): boolean {
    const val = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD_ENABLED);
    return val === null ? true : val === 'true';
  },

  setAdminPasswordRequired(required: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD_ENABLED, required ? 'true' : 'false');
    notifyDataChanged();
  },

  isCurrentDeviceAdmin(): boolean {
    try {
      return (
        sessionStorage.getItem('wcs_admin_auth') === 'true' ||
        localStorage.getItem(STORAGE_KEYS.ADMIN_DEVICE_FLAG) === 'true'
      );
    } catch {
      return false;
    }
  },

  setCurrentDeviceAdmin(isDeviceAdmin: boolean, rememberPermanent: boolean = false): void {
    try {
      if (isDeviceAdmin) {
        sessionStorage.setItem('wcs_admin_auth', 'true');
        if (rememberPermanent) {
          localStorage.setItem(STORAGE_KEYS.ADMIN_DEVICE_FLAG, 'true');
        }
      } else {
        sessionStorage.removeItem('wcs_admin_auth');
        localStorage.removeItem(STORAGE_KEYS.ADMIN_DEVICE_FLAG);
      }
      notifyDataChanged();
    } catch {}
  },
  getSalons(): Salon[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(INITIAL_SALONS));
      return INITIAL_SALONS;
    }
    try {
      const parsed: Salon[] = JSON.parse(raw);
      return parsed.map((s) => {
        const init = INITIAL_SALONS.find((i) => i.id === s.id);
        if (!s.advertisement && init?.advertisement) {
          return { ...s, advertisement: init.advertisement };
        }
        return s;
      });
    } catch {
      return INITIAL_SALONS;
    }
  },

  getSalonById(id: string): Salon | undefined {
    return this.getSalons().find((s) => s.id === id);
  },

  getSalonBySlug(slug: string): Salon | undefined {
    return this.getSalons().find((s) => s.slug === slug);
  },

  saveSalon(updated: Salon) {
    const salons = this.getSalons().map((s) => (s.id === updated.id ? updated : s));
    localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(salons));
    notifyDataChanged();
  },

  addSalon(newSalon: Salon) {
    const salons = [...this.getSalons(), newSalon];
    localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(salons));
    notifyDataChanged();
  },

  getActiveSalonId(): string {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_SALON_ID);
    return id || 'salon_abc';
  },

  setActiveSalonId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SALON_ID, id);
    notifyDataChanged();
  },

  getServices(salonId?: string): Service[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    let all: Service[] = INITIAL_SERVICES;
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {
        all = INITIAL_SERVICES;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    }

    // Gracefully hydrate initial demo image & video if not yet stored
    all = all.map((srv) => {
      const init = INITIAL_SERVICES.find((i) => i.id === srv.id);
      if (init) {
        return {
          ...srv,
          imageUrl: srv.imageUrl || init.imageUrl,
          videoUrl: srv.videoUrl || init.videoUrl,
        };
      }
      return srv;
    });

    return salonId ? all.filter((s: Service) => s.salonId === salonId) : all;
  },

  saveService(service: Service) {
    const all = this.getServices();
    const index = all.findIndex((s) => s.id === service.id);
    let updated;
    if (index >= 0) {
      updated = all.map((s) => (s.id === service.id ? service : s));
    } else {
      updated = [...all, service];
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    notifyDataChanged();
  },

  deleteService(serviceId: string) {
    const all = this.getServices().filter((s) => s.id !== serviceId);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(all));
    notifyDataChanged();
  },

  getStaff(salonId?: string): Staff[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    let all: Staff[] = INITIAL_STAFF;
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {
        all = INITIAL_STAFF;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    }
    return salonId ? all.filter((st: Staff) => st.salonId === salonId) : all;
  },

  saveStaff(staff: Staff) {
    const all = this.getStaff();
    const index = all.findIndex((s) => s.id === staff.id);
    const updated = index >= 0 ? all.map((s) => (s.id === staff.id ? staff : s)) : [...all, staff];
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated));
    notifyDataChanged();
  },

  getAppointments(salonId?: string): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    let all: Appointment[] = INITIAL_APPOINTMENTS;
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {
        all = INITIAL_APPOINTMENTS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    }
    return salonId ? all.filter((a: Appointment) => a.salonId === salonId) : all;
  },

  createAppointment(apt: Appointment): Appointment {
    const all = this.getAppointments();
    const updated = [apt, ...all];
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));

    // Update customer stats
    this.recordCustomerVisit(apt);

    // If WhatsApp is configured, generate initial WhatsApp log
    if (apt.paymentStatus === 'approved') {
      this.sendWhatsAppConfirmation(apt);
    } else {
      this.logWhatsAppMessage({
        id: `wa_${Date.now()}`,
        salonId: apt.salonId,
        recipientPhone: apt.customerWhatsapp,
        recipientName: apt.customerName,
        appointmentRef: apt.refCode,
        type: 'booking_received',
        messageText: `Hello ${apt.customerName},\n\nWe received your appointment request for ${apt.serviceName} on ${apt.date} at ${apt.startTime}.\n\nYour receipt has been submitted and is currently UNDER REVIEW by our salon team. Once confirmed, you will receive an official confirmation.\n\nRef: ${apt.refCode}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'delivered',
      });
    }

    notifyDataChanged();
    return apt;
  },

  updateAppointment(appointment: Appointment) {
    const all = this.getAppointments();
    const updated = all.map((a) => (a.id === appointment.id ? appointment : a));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
    notifyDataChanged();
  },

  approvePayment(appointmentId: string, verifiedBy = 'Salon Owner'): Appointment | undefined {
    const all = this.getAppointments();
    const target = all.find((a) => a.id === appointmentId);
    if (!target) return undefined;

    const updated: Appointment = {
      ...target,
      status: 'confirmed',
      paymentStatus: 'approved',
      verifiedBy,
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      whatsappConfirmationSent: true,
    };

    this.updateAppointment(updated);
    this.sendWhatsAppConfirmation(updated);
    notifyDataChanged();
    return updated;
  },

  rejectPayment(appointmentId: string, reason: string): Appointment | undefined {
    const all = this.getAppointments();
    const target = all.find((a) => a.id === appointmentId);
    if (!target) return undefined;

    const updated: Appointment = {
      ...target,
      status: 'cancelled',
      paymentStatus: 'rejected',
      rejectionReason: reason,
      cancellationReason: `Payment receipt rejected: ${reason}`,
    };

    this.updateAppointment(updated);
    this.logWhatsAppMessage({
      id: `wa_${Date.now()}`,
      salonId: target.salonId,
      recipientPhone: target.customerWhatsapp,
      recipientName: target.customerName,
      appointmentRef: target.refCode,
      type: 'cancelled',
      messageText: `Hello ${target.customerName},\n\nYour appointment (${target.refCode}) could not be confirmed because the payment receipt was not approved.\n\nReason: ${reason}\n\nPlease contact ${target.salonId} to re-submit your transfer.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'delivered',
    });
    notifyDataChanged();
    return updated;
  },

  sendWhatsAppConfirmation(apt: Appointment) {
    const salon = this.getSalonById(apt.salonId);
    const msg = `Hello ${apt.customerName},\n\nYour salon appointment has been confirmed! ✨\n\nSalon: ${salon?.name || 'Salon'}\nService: ${apt.serviceName}\nSpecialist: ${apt.staffName}\nDate: ${apt.date}\nTime: ${apt.startTime}\nAmount: ${apt.currency} ${apt.amount.toLocaleString()}\nPayment: Confirmed (Ref: ${apt.receiptRefNumber || 'Direct'})\n\nThank you for choosing ${salon?.name || 'us'}. Please arrive 5 minutes prior to your time slot.`;

    this.logWhatsAppMessage({
      id: `wa_${Date.now()}`,
      salonId: apt.salonId,
      recipientPhone: apt.customerWhatsapp,
      recipientName: apt.customerName,
      appointmentRef: apt.refCode,
      type: 'payment_confirmed',
      messageText: msg,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'delivered',
    });
  },

  getCustomers(salonId?: string): Customer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    let all: Customer[] = INITIAL_CUSTOMERS;
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {
        all = INITIAL_CUSTOMERS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    return salonId ? all.filter((c: Customer) => c.salonId === salonId) : all;
  },

  recordCustomerVisit(apt: Appointment) {
    const customers = this.getCustomers();
    const existing = customers.find(
      (c) => c.salonId === apt.salonId && (c.whatsapp === apt.customerWhatsapp || c.name.toLowerCase() === apt.customerName.toLowerCase())
    );

    if (existing) {
      existing.appointmentCount += 1;
      existing.totalSpent += apt.amount;
      existing.lastVisited = apt.date;
      if (apt.customerEmail && !existing.email) existing.email = apt.customerEmail;
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } else {
      const newCustomer: Customer = {
        id: `cst_${Date.now()}`,
        salonId: apt.salonId,
        name: apt.customerName,
        whatsapp: apt.customerWhatsapp,
        email: apt.customerEmail,
        appointmentCount: 1,
        totalSpent: apt.amount,
        lastVisited: apt.date,
        notes: apt.customerNotes,
      };
      customers.push(newCustomer);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  },

  getWhatsAppLogs(salonId?: string): WhatsAppMessageLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    let all: WhatsAppMessageLog[] = INITIAL_LOGS;
    if (raw) {
      try {
        all = JSON.parse(raw);
      } catch {
        all = INITIAL_LOGS;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    }
    return salonId ? all.filter((l: WhatsAppMessageLog) => l.salonId === salonId) : all;
  },

  logWhatsAppMessage(log: WhatsAppMessageLog) {
    const all = this.getWhatsAppLogs();
    const updated = [log, ...all];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));

    // Also record a real webhook event in integration health!
    this.recordWebhookEventFromMessage(log);
    notifyDataChanged();
  },

  getApiHealth(salonId: string): ApiIntegrationHealthData {
    const raw = localStorage.getItem(STORAGE_KEYS.API_HEALTH);
    let parsed: Record<string, ApiIntegrationHealthData> = INITIAL_API_HEALTH;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = INITIAL_API_HEALTH;
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.API_HEALTH, JSON.stringify(INITIAL_API_HEALTH));
    }

    if (parsed[salonId]) return parsed[salonId];

    // Default template for newly created salons
    const fallback: ApiIntegrationHealthData = {
      connectionStatus: 'connected',
      lastPingTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastPingLatencyMs: 65,
      totalWebhooksReceived: 12,
      successfulEvents: 12,
      failedEvents: 0,
      http4xxErrors: 0,
      http5xxErrors: 0,
      uptimePercentage: 100,
      webhookUrl: `https://ais-dev-goz2t6xq5hs32ilxsi2npa-712673850908.asia-southeast1.run.app/api/webhooks/whatsapp`,
      verifyToken: `wcs_token_${salonId}`,
      sslActive: true,
      events: [
        {
          id: `evt_${Date.now()}`,
          salonId,
          eventType: 'webhook.verify',
          status: 'success',
          httpStatus: 200,
          latencyMs: 58,
          payloadSummary: 'Webhook subscription verified with Meta Graph API',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        },
      ],
    };
    return fallback;
  },

  saveApiHealth(salonId: string, data: ApiIntegrationHealthData) {
    const raw = localStorage.getItem(STORAGE_KEYS.API_HEALTH);
    const parsed: Record<string, ApiIntegrationHealthData> = raw ? JSON.parse(raw) : INITIAL_API_HEALTH;
    parsed[salonId] = data;
    localStorage.setItem(STORAGE_KEYS.API_HEALTH, JSON.stringify(parsed));
    notifyDataChanged();
  },

  async pingWebhook(salonId: string): Promise<ApiIntegrationHealthData> {
    const health = this.getApiHealth(salonId);
    // Simulate real network latency roundtrip
    const simLatency = Math.floor(45 + Math.random() * 55);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newEvent: WebhookEventLog = {
      id: `evt_${Date.now()}`,
      salonId,
      eventType: 'ping',
      status: 'success',
      httpStatus: 200,
      latencyMs: simLatency,
      payloadSummary: `Meta Graph API health ping: OK (v21.0, latency ${simLatency}ms)`,
      timestamp: nowStr,
      rawPayload: { status: 'healthy', latency_ms: simLatency, node: 'asia-southeast1-edge' },
    };

    const updated: ApiIntegrationHealthData = {
      ...health,
      connectionStatus: 'connected',
      lastPingTimestamp: nowStr,
      lastPingLatencyMs: simLatency,
      totalWebhooksReceived: health.totalWebhooksReceived + 1,
      successfulEvents: health.successfulEvents + 1,
      events: [newEvent, ...health.events.slice(0, 49)],
    };

    this.saveApiHealth(salonId, updated);
    return updated;
  },

  resetErrorCounters(salonId: string): ApiIntegrationHealthData {
    const health = this.getApiHealth(salonId);
    const updated: ApiIntegrationHealthData = {
      ...health,
      failedEvents: 0,
      http4xxErrors: 0,
      http5xxErrors: 0,
      uptimePercentage: 100,
    };
    this.saveApiHealth(salonId, updated);
    return updated;
  },

  simulateWebhookEvent(
    salonId: string,
    eventType: 'messages.status' | 'messages.received' | 'webhook.verify' | 'ping',
    forceError = false
  ): ApiIntegrationHealthData {
    const health = this.getApiHealth(salonId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const latency = Math.floor(50 + Math.random() * 60);

    let httpStatus = 200;
    let status: 'success' | 'warning' | 'error' = 'success';
    let summary = '';
    let raw: Record<string, unknown> = {};

    if (forceError) {
      status = 'error';
      httpStatus = 502;
      summary = 'Meta Webhook delivery timeout (HTTP 502 Bad Gateway)';
      raw = { error: { message: 'Upstream gateway timed out awaiting salon ACK', code: 502 } };
    } else if (eventType === 'messages.status') {
      summary = `Customer delivery status updated: delivered (Ref: WCS-${Math.floor(1000 + Math.random() * 9000)})`;
      raw = {
        statuses: [
          {
            id: `wamid.HBgLOTE3...${Math.random().toString(36).substring(7)}`,
            status: 'delivered',
            timestamp: Math.floor(Date.now() / 1000),
          },
        ],
      };
    } else if (eventType === 'messages.received') {
      summary = 'Inbound WhatsApp message received from customer: "I am running 5 mins late"';
      raw = {
        messages: [
          {
            from: '94771234567',
            id: `wamid.HBgLOTE3...${Math.random().toString(36).substring(7)}`,
            text: { body: 'I am running 5 mins late' },
            type: 'text',
          },
        ],
      };
    } else if (eventType === 'webhook.verify') {
      summary = 'Webhook GET handshake challenge verified successfully (hub.challenge)';
      raw = { hub_mode: 'subscribe', hub_challenge: String(Date.now()).slice(-8) };
    } else {
      summary = `Meta Graph API ping health check: OK (${latency}ms)`;
      raw = { ping: 'pong', version: 'v21.0' };
    }

    const newEvent: WebhookEventLog = {
      id: `evt_${Date.now()}`,
      salonId,
      eventType,
      status,
      httpStatus,
      latencyMs: latency,
      payloadSummary: summary,
      timestamp: nowStr,
      rawPayload: raw,
    };

    const newTotal = health.totalWebhooksReceived + 1;
    const newSuccess = status === 'success' ? health.successfulEvents + 1 : health.successfulEvents;
    const newFailed = status === 'error' ? health.failedEvents + 1 : health.failedEvents;
    const new4xx = httpStatus >= 400 && httpStatus < 500 ? health.http4xxErrors + 1 : health.http4xxErrors;
    const new5xx = httpStatus >= 500 ? health.http5xxErrors + 1 : health.http5xxErrors;
    const uptime = Math.round((newSuccess / newTotal) * 1000) / 10;

    const updated: ApiIntegrationHealthData = {
      ...health,
      connectionStatus: status === 'error' ? 'degraded' : 'connected',
      lastPingTimestamp: nowStr,
      lastPingLatencyMs: latency,
      totalWebhooksReceived: newTotal,
      successfulEvents: newSuccess,
      failedEvents: newFailed,
      http4xxErrors: new4xx,
      http5xxErrors: new5xx,
      uptimePercentage: uptime,
      events: [newEvent, ...health.events.slice(0, 49)],
    };

    this.saveApiHealth(salonId, updated);
    return updated;
  },

  recordWebhookEventFromMessage(log: WhatsAppMessageLog) {
    const health = this.getApiHealth(log.salonId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const event: WebhookEventLog = {
      id: `evt_${Date.now()}`,
      salonId: log.salonId,
      eventType: 'messages.status',
      status: 'success',
      httpStatus: 200,
      latencyMs: Math.floor(55 + Math.random() * 40),
      payloadSummary: `Status webhook ACK for ${log.recipientPhone} (${log.appointmentRef}) - ${log.type}`,
      timestamp: nowStr,
      rawPayload: {
        entry: [
          {
            id: log.salonId,
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  statuses: [{ recipient_id: log.recipientPhone, status: 'delivered' }],
                },
              },
            ],
          },
        ],
      },
    };

    const updated: ApiIntegrationHealthData = {
      ...health,
      lastPingTimestamp: nowStr,
      totalWebhooksReceived: health.totalWebhooksReceived + 1,
      successfulEvents: health.successfulEvents + 1,
      events: [event, ...health.events.slice(0, 49)],
    };
    this.saveApiHealth(log.salonId, updated);
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.SALONS, JSON.stringify(INITIAL_SALONS));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(STORAGE_KEYS.API_HEALTH, JSON.stringify(INITIAL_API_HEALTH));
    notifyDataChanged();
  },
};
