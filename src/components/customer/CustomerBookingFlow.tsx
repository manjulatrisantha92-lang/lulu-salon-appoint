import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Salon, Service, Staff, Appointment, PaymentMethod } from '../../types/salon';
import {
  computeDayAvailability,
  getNextAvailableSlots,
  validateBookingAvailability,
  formatDatePretty,
  formatTime12,
  TimeSlot,
} from '../../utils/bookingEngine';
import { StorageService } from '../../services/storage';
import {
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building,
  Copy,
  Check,
  MessageSquare,
  FileText,
  Search,
  ChevronRight,
  Eye,
  MapPin,
  Lock,
  Play,
  Film,
  Video,
  Volume2,
  VolumeX,
  Maximize2,
} from 'lucide-react';

interface CustomerBookingFlowProps {
  salon: Salon;
  services: Service[];
  staffList: Staff[];
  appointments: Appointment[];
  onBookingComplete?: (newAppointment: Appointment) => void;
  onOpenStatusLookup?: (refCode?: string) => void;
  onOpenStaffLogin?: () => void;
}

export const CustomerBookingFlow: React.FC<CustomerBookingFlowProps> = ({
  salon,
  services,
  staffList,
  appointments,
  onBookingComplete,
  onOpenStatusLookup,
  onOpenStaffLogin,
}) => {
  // Step state: 1: Service, 2: Staff, 3: Date & Time, 4: Customer Details, 5: Payment & Slip, 6: Success Pass
  const [step, setStep] = useState<number>(1);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [selectedStaffId, setSelectedStaffId] = useState<string>('any'); // 'any' or specific staff id

  // Default date to tomorrow if today is late, or today (2026-09-29)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-30');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  const [customerName, setCustomerName] = useState<string>('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState<string>('+94 77 123 4567');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptRefNumber, setReceiptRefNumber] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedAppointment, setCompletedAppointment] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerVideoModal, setCustomerVideoModal] = useState<{ title: string; url: string } | null>(null);
  const [isAdMuted, setIsAdMuted] = useState<boolean>(true);

  // Filtered services
  const categories = useMemo(() => {
    const set = new Set(services.filter((s) => s.active).map((s) => s.category));
    return ['All', ...Array.from(set)];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (!s.active) return false;
      const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
      const matchQuery =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [services, selectedCategory, searchQuery]);

  // Active staff filtered for the salon
  const activeStaff = useMemo(() => staffList.filter((s) => s.active), [staffList]);

  // Compute availability for current selected date & staff
  const dayAvailability = useMemo(() => {
    const duration = selectedService?.durationMinutes || 30;
    return computeDayAvailability(
      salon,
      selectedDate,
      activeStaff,
      appointments,
      selectedStaffId,
      duration
    );
  }, [salon, selectedDate, activeStaff, appointments, selectedStaffId, selectedService]);

  // Next available slots suggestion if a booked slot or target time is considered
  const nextAvailableSlots = useMemo(() => {
    return getNextAvailableSlots(dayAvailability, selectedTimeSlot || undefined, 4);
  }, [dayAvailability, selectedTimeSlot]);

  // Handle fake or real receipt upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Receipt file size must be under 5MB.');
      return;
    }

    setIsUploadingReceipt(true);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
      setIsUploadingReceipt(false);
      setErrorMessage(null);
    };
    reader.onerror = () => {
      setErrorMessage('Could not load image. Please select a valid JPG or PNG.');
      setIsUploadingReceipt(false);
    };
    reader.readAsDataURL(file);
  };

  // Sample slip helper for fast reviewer testing
  const useSampleSlip = () => {
    setReceiptImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
    setReceiptRefNumber(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const copyBankDetails = () => {
    const text = `${salon.bankDetails.bankName}\nAccount: ${salon.bankDetails.accountNumber}\nName: ${salon.bankDetails.accountName}\nBranch: ${salon.bankDetails.branch}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  // Submit appointment
  const handleSubmitBooking = () => {
    setErrorMessage(null);

    if (!selectedService) {
      setErrorMessage('Please select a service.');
      setStep(1);
      return;
    }
    if (!selectedTimeSlot) {
      setErrorMessage('Please select an available time slot.');
      setStep(3);
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      setStep(4);
      return;
    }
    if (!customerWhatsapp.trim() || customerWhatsapp.length < 9) {
      setErrorMessage('Please enter a valid WhatsApp phone number (e.g. +94 77 123 4567).');
      setStep(4);
      return;
    }
    if (paymentMethod === 'bank_transfer' && salon.settings.requirePaymentReceipt && !receiptImage) {
      setErrorMessage('Please upload your payment bank transfer receipt slip before confirming.');
      return;
    }

    // Double booking verification
    const validation = validateBookingAvailability(
      salon,
      selectedDate,
      selectedTimeSlot,
      selectedService.durationMinutes,
      selectedStaffId,
      activeStaff,
      appointments
    );

    if (!validation.canBook) {
      setErrorMessage(`Cannot complete booking: ${validation.reason}`);
      setStep(3);
      return;
    }

    setIsSubmitting(true);

    const assignedStaff =
      selectedStaffId === 'any'
        ? validation.suggestedStaff || activeStaff[0]
        : activeStaff.find((s) => s.id === selectedStaffId) || activeStaff[0];

    // Compute end time
    const [startH, startM] = selectedTimeSlot.split(':').map(Number);
    const totalMins = startH * 60 + startM + selectedService.durationMinutes;
    const endH = Math.floor(totalMins / 60);
    const endM = totalMins % 60;
    const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    const refNumber = `WCS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      refCode: refNumber,
      salonId: salon.id,
      customerId: `cst_${Date.now()}`,
      customerName: customerName.trim(),
      customerWhatsapp: customerWhatsapp.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerNotes: customerNotes.trim() || undefined,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceDuration: selectedService.durationMinutes,
      staffId: assignedStaff.id,
      staffName: assignedStaff.name,
      date: selectedDate,
      startTime: selectedTimeSlot,
      endTime: endTimeStr,
      amount: selectedService.price,
      currency: salon.currency,
      status: paymentMethod === 'cash_on_arrival' ? 'confirmed' : 'pending_verification',
      paymentStatus:
        paymentMethod === 'cash_on_arrival' ? 'unpaid' : 'pending_review',
      paymentMethod,
      receiptUrl: receiptImage || undefined,
      receiptRefNumber: receiptRefNumber.trim() || `SLIP-${Date.now().toString().slice(-6)}`,
      receiptUploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      whatsappConfirmationSent: paymentMethod === 'cash_on_arrival',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setTimeout(() => {
      StorageService.createAppointment(newAppointment);
      setCompletedAppointment(newAppointment);
      setIsSubmitting(false);
      setStep(6);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#F59E0B', '#10B981', '#ffffff'],
      });

      if (onBookingComplete) {
        onBookingComplete(newAppointment);
      }
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Salon Brand Header Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Salon Profile & Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {salon.logoUrl ? (
                <img src={salon.logoUrl} alt={salon.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-xl font-bold text-amber-400">
                  {salon.name.slice(0, 2)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400">
                  {salon.city ? `${salon.city} · ` : ''}Verified Salon
                </span>
                {salon.rating && (
                  <>
                    <span className="text-neutral-600">·</span>
                    <span className="text-xs text-neutral-400 font-medium">★ {salon.rating} ({salon.reviewCount || 0})</span>
                  </>
                )}
              </div>
              <h1 className="font-serif text-xl md:text-2xl font-bold text-white tracking-tight truncate">
                {salon.name}
              </h1>
              {salon.tagline && <p className="text-xs text-neutral-400 truncate mt-0.5">{salon.tagline}</p>}
              {salon.address && (
                <p className="text-[11px] text-neutral-400 truncate mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  {salon.address}{salon.city ? `, ${salon.city}` : ''}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  {salon.settings.openTime} - {salon.settings.closeTime}
                </span>
                {salon.whatsapp && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp: {salon.whatsapp}
                  </span>
                )}
                {salon.phone && salon.phone !== salon.whatsapp && (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Phone className="w-3.5 h-3.5" />
                    {salon.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Buttons & Salon Advertisements Player */}
          <div className="flex flex-col items-end gap-3 shrink-0 w-full lg:w-72">
            <div className="flex items-center gap-2 self-end">
              {onOpenStatusLookup && (
                <button
                  type="button"
                  onClick={() => onOpenStatusLookup()}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                  title="Look up your booking by reference code"
                >
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Track Booking</span>
                </button>
              )}

              {onOpenStaffLogin && (
                <button
                  type="button"
                  onClick={() => onOpenStaffLogin()}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm group"
                  title="Go to Salon Admin Panel (Admin device password entry)"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            {/* User Requested: Right side play in salon advertisements */}
            {salon.advertisement?.enabled && salon.advertisement?.mediaUrl && (
              <div className="w-full rounded-2xl overflow-hidden border border-neutral-800/90 bg-neutral-950 relative group shadow-xl">
                {salon.advertisement.type === 'video' ? (
                  <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                    <video
                      key={salon.advertisement.mediaUrl}
                      src={salon.advertisement.mediaUrl}
                      autoPlay
                      loop
                      muted={isAdMuted}
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

                    {/* Top badges & audio mute control */}
                    <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto">
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold flex items-center gap-1 shadow">
                        <Sparkles className="w-2.5 h-2.5" />
                        {salon.advertisement.badge || 'PROMO'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAdMuted(!isAdMuted);
                        }}
                        className="p-1 rounded-full bg-black/70 hover:bg-neutral-900 text-white backdrop-blur-sm transition-colors"
                        title={isAdMuted ? 'Unmute Audio' : 'Mute Audio'}
                      >
                        {isAdMuted ? (
                          <VolumeX className="w-3 h-3 text-neutral-300" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-amber-400" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Caption & Fullscreen preview */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between gap-2 pointer-events-auto">
                      <div className="min-w-0">
                        {salon.advertisement.title && (
                          <div className="text-[11px] font-bold text-white truncate leading-tight">
                            {salon.advertisement.title}
                          </div>
                        )}
                        {salon.advertisement.description && (
                          <div className="text-[9px] text-neutral-300 truncate">
                            {salon.advertisement.description}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCustomerVideoModal({
                            title: salon.advertisement?.title || `${salon.name} · Advertisement`,
                            url: salon.advertisement!.mediaUrl,
                          })
                        }
                        className="p-1 rounded-lg bg-white/20 hover:bg-amber-500 hover:text-neutral-950 text-white backdrop-blur-sm shrink-0 transition-colors"
                        title="Expand / Fullscreen Ad"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                    <img
                      src={salon.advertisement.mediaUrl}
                      alt={salon.advertisement.title || 'Salon Advertisement'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-extrabold flex items-center gap-1 shadow">
                        <Sparkles className="w-2.5 h-2.5" />
                        {salon.advertisement.badge || 'SPECIAL OFFER'}
                      </span>
                    </div>
                    {salon.advertisement.title && (
                      <div className="absolute bottom-2 left-2.5 right-2.5">
                        <div className="text-[11px] font-bold text-white truncate">
                          {salon.advertisement.title}
                        </div>
                        {salon.advertisement.description && (
                          <div className="text-[9px] text-neutral-300 truncate">
                            {salon.advertisement.description}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Wizard Step Progress Tracker */}
        {step < 6 && (
          <div className="mt-5 pt-4 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-xs font-medium text-neutral-400 mb-2">
              <span>
                Step {step} of 5:{' '}
                <strong className="text-white">
                  {step === 1 && 'Select Service'}
                  {step === 2 && 'Select Specialist'}
                  {step === 3 && 'Choose Date & Time'}
                  {step === 4 && 'Your Details'}
                  {step === 5 && 'Payment & Receipt'}
                </strong>
              </span>
              <span className="font-mono text-amber-400">{Math.round((step / 5) * 100)}%</span>
            </div>
            <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Select a Service</h2>
              <p className="text-xs text-neutral-400">Choose from our curated salon menu</p>
            </div>
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-neutral-950 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredServices.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3.5 sm:gap-4 ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-500/80 ring-1 ring-amber-500/50'
                      : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  {/* Service Image (JPG) Thumbnail */}
                  {service.imageUrl && (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-950 border border-neutral-800 relative group">
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {service.videoUrl && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-4 h-4 text-amber-400 fill-current" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white truncate">{service.name}</h3>
                      {service.badge && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {service.badge}
                        </span>
                      )}
                      {service.videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomerVideoModal({ title: service.name, url: service.videoUrl! });
                          }}
                          className="px-2 py-0.5 rounded-full bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-colors border border-amber-500/30"
                          title="Watch short demonstration video clip"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Video Clip</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-neutral-500 pt-0.5">
                      <span className="flex items-center gap-1 font-mono text-neutral-400">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {service.durationMinutes} min
                      </span>
                      <span>·</span>
                      <span className="text-neutral-400">{service.category}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch pl-2">
                    <div>
                      <span className="text-xs text-neutral-500 font-mono">{salon.currency}</span>
                      <span className="text-base font-bold text-white font-mono ml-1">
                        {service.price.toLocaleString()}
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'border border-neutral-700 text-neutral-600'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => {
                if (!selectedService) {
                  setErrorMessage('Please select a service to proceed.');
                  return;
                }
                setErrorMessage(null);
                setStep(2);
              }}
              disabled={!selectedService}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
            >
              Continue to Specialist
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT STAFF */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Choose Your Specialist</h2>
              <p className="text-xs text-neutral-400">Select your preferred stylist or select any available</p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Any Available Staff Option */}
            <div
              onClick={() => setSelectedStaffId('any')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                selectedStaffId === 'any'
                  ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/50'
                  : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">Any Available Specialist</h4>
                <p className="text-xs text-neutral-400">Fastest booking & flexible times</p>
                <div className="text-[11px] text-amber-400/90 mt-0.5">Recommended for quickest slot</div>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  selectedStaffId === 'any'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'border border-neutral-700'
                }`}
              >
                {selectedStaffId === 'any' ? '✓' : ''}
              </div>
            </div>

            {/* Individual Staff Cards */}
            {activeStaff.map((staff) => {
              const isSelected = selectedStaffId === staff.id;
              return (
                <div
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-neutral-900/60 hover:bg-neutral-900 border-neutral-800'
                  }`}
                >
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-semibold text-white truncate">{staff.name}</h4>
                      <span className="text-[10px] text-amber-400 font-mono">★ {staff.rating}</span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate">{staff.role}</p>
                    <div className="text-[10px] text-neutral-500 truncate mt-0.5">
                      Specialties: {staff.specialties.join(', ')}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 font-bold'
                        : 'border border-neutral-700'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
            >
              Select Date & Time
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT DATE & TIME (Smart Capacity & Time Slot Engine) */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Select Date & Time</h2>
              <p className="text-xs text-neutral-400">
                Live availability for {selectedService?.name} ({selectedService?.durationMinutes} min)
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </div>

          {/* Quick Date Selector (Today, Tomorrow, +2 days, etc.) */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Appointment Date
              </label>
              {/* Daily Capacity Counter Badge */}
              <div className="text-xs font-mono">
                <span className="text-neutral-400">Daily Bookings: </span>
                <span
                  className={`font-semibold ${
                    dayAvailability.isFullyBooked
                      ? 'text-rose-400'
                      : dayAvailability.totalAppointments > 12
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {dayAvailability.totalAppointments} / {dayAvailability.maxAppointments}
                </span>
              </div>
            </div>

            {/* Quick 5-day picker buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {['2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03'].map((dStr) => {
                const isSelected = selectedDate === dStr;
                const dObj = new Date(dStr);
                const dayNum = dStr.split('-')[2];
                const dayLabel =
                  dStr === '2026-09-29'
                    ? 'Today'
                    : dStr === '2026-09-30'
                    ? 'Tomorrow'
                    : dObj.toLocaleDateString('en-US', { weekday: 'short' });
                // Check if this date has special status
                const isSampleFull = dStr === '2026-10-02';

                return (
                  <button
                    key={dStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dStr);
                      setSelectedTimeSlot('');
                    }}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md font-bold'
                        : isSampleFull
                        ? 'bg-neutral-950/60 text-neutral-500 border-rose-900/40 hover:border-rose-700'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">{dayLabel}</div>
                    <div className="text-base font-bold my-0.5">{dayNum}</div>
                    <div className="text-[10px] opacity-80">
                      {isSampleFull ? 'FULL' : dStr === '2026-09-29' ? 'Open' : 'Sep/Oct'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Native date picker input */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-neutral-400">Or pick calendar date:</span>
              <input
                type="date"
                value={selectedDate}
                min="2026-09-29"
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot('');
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Section 14: Fully Booked Alert Banner */}
          {dayAvailability.isFullyBooked && (
            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-900/50 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-rose-200">⚠️ FULLY BOOKED</h3>
              <p className="text-xs text-rose-300 max-w-md mx-auto">
                Sorry, all appointments for{' '}
                <strong>{formatDatePretty(selectedDate)}</strong> have reached the salon daily limit of {dayAvailability.maxAppointments} bookings.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate('2026-09-30');
                    setSelectedTimeSlot('');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                >
                  Select Tomorrow (30 Sep)
                </button>
              </div>
            </div>
          )}

          {/* Closed day or holiday alert */}
          {(dayAvailability.isClosedDay || dayAvailability.isHoliday) && (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-center space-y-2">
              <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-amber-200">
                {dayAvailability.isHoliday
                  ? `Salon Holiday: ${dayAvailability.holidayTitle}`
                  : `Salon Closed on ${dayAvailability.dayName}s`}
              </h3>
              <p className="text-xs text-amber-300">
                Please pick an open operating day to see available slots.
              </p>
            </div>
          )}

          {/* Time Slots Grid (Sections 5 & 15 of brief) */}
          {!dayAvailability.isFullyBooked && !dayAvailability.isClosedDay && !dayAvailability.isHoliday && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Available Time Slots ({dayAvailability.slots.filter((s) => s.available).length} Open)
                </h3>
                <span className="text-[11px] text-neutral-500">
                  {dayAvailability.dayName}, {formatDatePretty(selectedDate)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {dayAvailability.slots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-lg font-bold'
                          : slot.available
                          ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-800 hover:border-neutral-700 cursor-pointer'
                          : 'bg-neutral-950 text-neutral-600 border-neutral-900 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold">{slot.formattedTime}</span>
                        {slot.available ? (
                          <span
                            className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                              isSelected ? 'text-neutral-950' : 'text-emerald-400'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {isSelected ? 'Chosen' : 'Available'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400/80 font-semibold flex items-center gap-0.5">
                            <XCircle className="w-3 h-3" /> Booked
                          </span>
                        )}
                      </div>

                      {/* Specialist hint */}
                      {slot.available && slot.assignedStaffName && (
                        <div
                          className={`text-[10px] truncate mt-1 ${
                            isSelected ? 'text-neutral-900' : 'text-neutral-400'
                          }`}
                        >
                          Stylist: {slot.assignedStaffName.split(' ')[0]}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Section 7: Next Available Times recommendation */}
              {selectedTimeSlot &&
                !dayAvailability.slots.find((s) => s.time === selectedTimeSlot)?.available && (
                  <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
                    <div className="text-xs text-rose-300 font-semibold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      {formatTime12(selectedTimeSlot)} is already booked.
                    </div>
                    <div className="text-xs text-neutral-400">Next available times today:</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {nextAvailableSlots.map((ns) => (
                        <button
                          key={ns.time}
                          type="button"
                          onClick={() => setSelectedTimeSlot(ns.time)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-medium"
                        >
                          Select {ns.formattedTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!selectedTimeSlot) {
                  setErrorMessage('Please select a time slot.');
                  return;
                }
                setErrorMessage(null);
                setStep(4);
              }}
              disabled={!selectedTimeSlot || dayAvailability.isFullyBooked}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-neutral-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
            >
              Enter Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CUSTOMER DETAILS */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Your Contact Details</h2>
              <p className="text-xs text-neutral-400">
                We will send your real-time booking confirmation directly to your WhatsApp
              </p>
            </div>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Kamal Perera"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                WhatsApp Phone Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Include country code (e.g. +94). Automated reminders & receipt approvals will be sent here.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="kamal@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Special Requests or Hair/Skin Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. sensitive skin, specific styling preference, event on the same evening..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (!customerName.trim()) {
                  setErrorMessage('Please enter your name.');
                  return;
                }
                if (!customerWhatsapp.trim()) {
                  setErrorMessage('Please enter your WhatsApp number.');
                  return;
                }
                setErrorMessage(null);
                setStep(5);
              }}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: PAYMENT INTERFACE & RECEIPT UPLOAD (Sections 9, 10 & 11) */}
      {step === 5 && selectedService && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Payment & Receipt</h2>
              <p className="text-xs text-neutral-400">Review your appointment and complete verification</p>
            </div>
            <button
              onClick={() => setStep(4)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </div>

          {/* Appointment Summary Box */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Appointment Summary
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block">Salon</span>
                <span className="text-white font-medium">{salon.name}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Service</span>
                <span className="text-white font-medium">{selectedService.name}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Date & Time</span>
                <span className="text-white font-medium">
                  {formatDatePretty(selectedDate)} at {formatTime12(selectedTimeSlot)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Specialist</span>
                <span className="text-white font-medium">
                  {selectedStaffId === 'any'
                    ? 'Assigned on arrival'
                    : activeStaff.find((s) => s.id === selectedStaffId)?.name}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400">Total Payable</span>
                <div className="text-xs text-neutral-500">Includes all salon service taxes</div>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono text-neutral-400 mr-1">{salon.currency}</span>
                <span className="text-2xl font-bold font-mono text-amber-400">
                  {selectedService.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/50'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Bank Transfer / Online Slip</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Transfer & upload deposit slip</p>
                </div>
              </button>

              {salon.settings.allowCashOnArrival && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_on_arrival')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    paymentMethod === 'cash_on_arrival'
                      ? 'bg-neutral-900 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Pay at Salon (Cash)</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Pay upon service completion</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Bank Details & Receipt Uploader (Only if Bank Transfer) */}
          {paymentMethod === 'bank_transfer' && (
            <div className="space-y-4">
              {/* Salon Bank Account Card */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    Salon Bank Transfer Details
                  </span>
                  <button
                    type="button"
                    onClick={copyBankDetails}
                    className="text-[11px] text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-lg"
                  >
                    {copiedBank ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedBank ? 'Copied Details' : 'Copy All'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500">Bank:</span>
                    <div className="font-semibold text-white">{salon.bankDetails.bankName}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Account Name:</span>
                    <div className="font-semibold text-white truncate">{salon.bankDetails.accountName}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Account Number:</span>
                    <div className="font-mono font-bold text-amber-300 text-sm">{salon.bankDetails.accountNumber}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500">Branch:</span>
                    <div className="font-semibold text-white">{salon.bankDetails.branch}</div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-neutral-500 bg-neutral-900 p-2 rounded-lg">
                  Amount to transfer:{' '}
                  <strong className="text-white font-mono">
                    {salon.currency} {selectedService.price.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Upload Payment Receipt Dropzone */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    Upload Payment Receipt / Deposit Slip <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={useSampleSlip}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono"
                  >
                    [Auto-Fill Sample Slip]
                  </button>
                </div>

                {receiptImage ? (
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={receiptImage}
                        alt="Receipt Preview"
                        className="w-14 h-14 object-cover rounded-lg border border-neutral-700"
                      />
                      <div>
                        <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Receipt Uploaded
                        </div>
                        <div className="text-[11px] text-neutral-400">Ready for admin verification</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptImage(null)}
                      className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-neutral-900"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-700 hover:border-amber-500 rounded-xl cursor-pointer bg-neutral-950/60 transition-colors">
                    <Upload className="w-6 h-6 text-neutral-400 mb-2" />
                    <span className="text-xs font-medium text-neutral-300">
                      Click to upload bank transfer slip
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">
                      JPG, PNG, JPEG or screenshot (Max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                )}

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">
                    Bank Reference / Transaction ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TXN-894102 or Cheque / Slip #"
                    value={receiptRefNumber}
                    onChange={(e) => setReceiptRefNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-600 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-between">
            <button
              onClick={() => setStep(4)}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-medium"
            >
              Back
            </button>
            <button
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-xl shadow-amber-500/25"
            >
              {isSubmitting ? (
                <span>Submitting Appointment...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Reserve Appointment
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: BOOKING CONFIRMATION & APPOINTMENT PASS (Sections 11 & 12) */}
      {step === 6 && completedAppointment && (
        <div className="space-y-6 text-center animate-fade-in">
          {/* Success Banner */}
          <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Appointment Successfully Submitted
            </span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1">
              Thank You, {completedAppointment.customerName}!
            </h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              Your appointment request has been recorded in the salon system.
            </p>

            {/* Reference Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-950 border border-neutral-800 my-4 shadow-inner">
              <span className="text-xs text-neutral-500">Booking Reference:</span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {completedAppointment.refCode}
              </span>
            </div>

            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
                <span className="text-xs text-neutral-400">Verification Status</span>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                    completedAppointment.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {completedAppointment.status === 'confirmed'
                    ? '● Confirmed'
                    : '⏳ Under Review (Pending Payment)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500">Service:</span>
                  <div className="text-white font-medium">{completedAppointment.serviceName}</div>
                </div>
                <div>
                  <span className="text-neutral-500">Specialist:</span>
                  <div className="text-white font-medium">{completedAppointment.staffName}</div>
                </div>
                <div>
                  <span className="text-neutral-500">Date:</span>
                  <div className="text-white font-medium">{formatDatePretty(completedAppointment.date)}</div>
                </div>
                <div>
                  <span className="text-neutral-500">Time Slot:</span>
                  <div className="text-white font-medium">{formatTime12(completedAppointment.startTime)}</div>
                </div>
              </div>

              {completedAppointment.paymentStatus === 'pending_review' && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                  ℹ️ The salon administrator is reviewing your payment receipt. You will receive an automated WhatsApp confirmation message once approved.
                </div>
              )}
            </div>
          </div>

          {/* Section 12: Simulated WhatsApp Notification Preview Card */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-emerald-900/40 text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center font-bold text-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-emerald-300">
                  Automated WhatsApp Notification
                </h4>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">To: {completedAppointment.customerWhatsapp}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
              {`Hello ${completedAppointment.customerName},\n\nWe received your salon appointment request at ${salon.name}.\n\n📅 Date: ${completedAppointment.date}\n⏰ Time: ${formatTime12(completedAppointment.startTime)}\n💇 Specialist: ${completedAppointment.staffName}\n💰 Amount: ${completedAppointment.currency} ${completedAppointment.amount.toLocaleString()}\nRef: ${completedAppointment.refCode}\n\nOur team is reviewing your transfer slip and will send official confirmation shortly!`}
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={`https://wa.me/${(salon.whatsapp || '94771234567').replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(
                  salon.name
                )},%20I%20just%20submitted%20booking%20${completedAppointment.refCode}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat with Salon on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => {
                  if (onOpenStatusLookup) onOpenStatusLookup(completedAppointment.refCode);
                }}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Check Real-Time Status →
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setStep(1);
                setSelectedService(null);
                setSelectedTimeSlot('');
                setReceiptImage(null);
                setReceiptRefNumber('');
                setCompletedAppointment(null);
              }}
              className="px-5 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-white text-xs font-semibold"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      )}

      {/* Customer Mobile & Tablet Footer */}
      <footer className="mt-12 text-center text-xs text-neutral-500 space-y-2 pb-6 border-t border-neutral-900 pt-6">
        <p>© 2026 {salon.name}. All rights reserved.</p>
        <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-600">
          <span>Instant Mobile QR Booking</span>
          {onOpenStaffLogin && (
            <>
              <span>·</span>
              <button
                type="button"
                onClick={onOpenStaffLogin}
                className="text-neutral-500 hover:text-amber-400 font-medium flex items-center gap-1.5 transition-colors underline underline-offset-4 decoration-neutral-700 hover:decoration-amber-400"
                title="Salon Staff and Management Portal (Password Required)"
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Go to Admin Panel (Admin Device Only)</span>
              </button>
            </>
          )}
        </div>
      </footer>
      {/* Customer Video Clip Player Modal */}
      {customerVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-5 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <h4 className="font-serif text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400 fill-current" />
                <span>{customerVideoModal.title} · Service Demonstration</span>
              </h4>
              <button
                onClick={() => setCustomerVideoModal(null)}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                src={customerVideoModal.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
