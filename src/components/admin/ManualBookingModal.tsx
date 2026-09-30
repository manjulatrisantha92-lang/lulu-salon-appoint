import React, { useState, useMemo } from 'react';
import { Salon, Staff, Service, Appointment, PaymentMethod, PaymentStatus } from '../../types/salon';
import { StorageService } from '../../services/storage';
import { computeDayAvailability, formatTime12, formatDatePretty } from '../../utils/bookingEngine';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  DollarSign,
  X,
  Plus,
  Sparkles,
} from 'lucide-react';

interface ManualBookingModalProps {
  salon: Salon;
  staffList: Staff[];
  services: Service[];
  appointments: Appointment[];
  initialDate?: string;
  initialTime?: string;
  initialStaffId?: string;
  onClose: () => void;
  onCreated: (newApt: Appointment) => void;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  salon,
  staffList,
  services,
  appointments,
  initialDate = '2026-09-29',
  initialTime = '10:00',
  initialStaffId = 'any',
  onClose,
  onCreated,
}) => {
  const activeServices = useMemo(() => services.filter((s) => s.salonId === salon.id && s.active), [services, salon.id]);
  const activeStaff = useMemo(() => staffList.filter((s) => s.salonId === salon.id && s.active), [staffList, salon.id]);

  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerNotes, setCustomerNotes] = useState('Manual booking (Walk-in / Phone reservation)');

  const [selectedServiceId, setSelectedServiceId] = useState<string>(activeServices[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialStaffId);
  const [date, setDate] = useState<string>(initialDate);
  const [time, setTime] = useState<string>(initialTime);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_arrival');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('approved');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [allowDoubleBookingOverride, setAllowDoubleBookingOverride] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedService = activeServices.find((s) => s.id === selectedServiceId) || activeServices[0];

  // Compute availability for chosen date & staff
  const dayAvailability = useMemo(() => {
    return computeDayAvailability(
      salon,
      date,
      activeStaff,
      appointments,
      selectedStaffId,
      selectedService?.durationMinutes || 30
    );
  }, [salon, date, activeStaff, appointments, selectedStaffId, selectedService]);

  const isSlotBooked = useMemo(() => {
    const slot = dayAvailability.slots.find((s) => s.time === time);
    return slot ? !slot.available : false;
  }, [dayAvailability, time]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter the customer name or "Walk-in Guest".');
      return;
    }
    if (!selectedService) {
      setErrorMessage('Please select a salon service.');
      return;
    }

    if (isSlotBooked && !allowDoubleBookingOverride) {
      setErrorMessage(
        'This time slot is already booked for this specialist. Check "Override & force schedule" below if you wish to double-book.'
      );
      return;
    }

    // Determine assigned staff
    let staffName = 'Any Available Specialist';
    let finalStaffId = selectedStaffId;

    if (selectedStaffId === 'any') {
      const freeStaff = activeStaff.find((s) => s.availableDays.includes(dayAvailability.dayOfWeek));
      if (freeStaff) {
        finalStaffId = freeStaff.id;
        staffName = freeStaff.name;
      } else if (activeStaff.length > 0) {
        finalStaffId = activeStaff[0].id;
        staffName = activeStaff[0].name;
      }
    } else {
      const match = activeStaff.find((s) => s.id === selectedStaffId);
      if (match) {
        staffName = match.name;
      }
    }

    // Compute end time
    const [h, m] = time.split(':').map(Number);
    const endMinutes = h * 60 + m + selectedService.durationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTimeStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    const refNumber = `WCS-MAN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      refCode: refNumber,
      salonId: salon.id,
      customerId: `cst_man_${Date.now()}`,
      customerName: customerName.trim(),
      customerWhatsapp: customerWhatsapp.trim() || salon.whatsapp || '+94 77 123 4567',
      customerEmail: customerEmail.trim() || undefined,
      customerNotes: customerNotes.trim() || undefined,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      serviceDuration: selectedService.durationMinutes,
      staffId: finalStaffId,
      staffName,
      date,
      startTime: time,
      endTime: endTimeStr,
      amount: selectedService.price,
      currency: salon.currency,
      status: 'confirmed',
      paymentStatus,
      paymentMethod,
      whatsappConfirmationSent: Boolean(sendWhatsApp && customerWhatsapp.trim()),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    StorageService.createAppointment(newAppointment);

    // If send whatsapp requested and number provided, log automated confirmation
    if (sendWhatsApp && customerWhatsapp.trim()) {
      StorageService.logWhatsAppMessage({
        id: `wa_${Date.now()}`,
        salonId: salon.id,
        recipientPhone: customerWhatsapp.trim(),
        recipientName: customerName.trim(),
        appointmentRef: refNumber,
        type: 'payment_confirmed',
        messageText: `Hello ${customerName},\n\nYour salon appointment has been manually scheduled! ✨\n\nSalon: ${salon.name}\nService: ${selectedService.name}\nSpecialist: ${staffName}\nDate: ${formatDatePretty(date)}\nTime: ${formatTime12(time)}\nAmount: ${salon.currency} ${selectedService.price.toLocaleString()}\nPayment: ${paymentStatus === 'approved' ? 'Confirmed / Paid' : 'Pay at counter'}\nRef: ${refNumber}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'delivered',
      });
    }

    onCreated(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm"
        >
          ✕
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Salon Reception Desk
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-xs text-neutral-400">{salon.name}</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-white mt-0.5 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Add Manual Appointment / Walk-in Booking
          </h3>
          <p className="text-xs text-neutral-400">
            Schedule an appointment for phone inquiries, walk-in guests, or VIP reservations
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Details */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h4 className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Customer Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">
                  Customer Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamal Perera or Walk-in"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">
                  WhatsApp / Phone <span className="text-neutral-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="+94 77 123 4567"
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">
                Booking Notes / Client Request <span className="text-neutral-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Phone reservation, prefers chair #2, requested quick wash"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Service & Staff Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Salon Service <span className="text-amber-400">*</span>
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                {activeServices.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — {salon.currency} {srv.price.toLocaleString()} ({srv.durationMinutes}m)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Assigned Specialist
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="any">Any Available Specialist</option>
                {activeStaff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Slot Picker */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h4 className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Schedule Timing & Slot Availability
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Appointment Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Time Slot (Start Time)</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                />
              </div>
            </div>

            {/* Live slot status alert */}
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-neutral-400">
                Slot status for {formatDatePretty(date)} at {formatTime12(time)}:
              </span>
              {isSlotBooked ? (
                <span className="font-mono text-rose-400 font-semibold flex items-center gap-1">
                  ✕ Slot Occupied / Busy
                </span>
              ) : (
                <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ Slot Available
                </span>
              )}
            </div>

            {isSlotBooked && (
              <label className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDoubleBookingOverride}
                  onChange={(e) => setAllowDoubleBookingOverride(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <span>Override & force schedule (Manager override for walk-in/VIP)</span>
              </label>
            )}
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
              >
                <option value="cash_on_arrival">Cash at Salon Counter</option>
                <option value="bank_transfer">Bank Transfer / Online Slip</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-medium mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
              >
                <option value="approved">Approved & Paid (Confirmed)</option>
                <option value="unpaid">Unpaid (Pay after service)</option>
                <option value="pending_review">Pending Review</option>
              </select>
            </div>
          </div>

          {/* WhatsApp toggle */}
          {customerWhatsapp && (
            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="rounded text-emerald-500"
              />
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Send automated booking confirmation WhatsApp message to {customerWhatsapp}
              </span>
            </label>
          )}

          {/* Summary Bar & Submit */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
            <div>
              <span className="text-neutral-500 block text-[11px]">Appointment Total</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {salon.currency} {selectedService?.price.toLocaleString() || 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Schedule Appointment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
