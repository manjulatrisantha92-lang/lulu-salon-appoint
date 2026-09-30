import React, { useState, useMemo } from 'react';
import { Appointment, Salon, Staff, Service } from '../../types/salon';
import { StorageService } from '../../services/storage';
import { formatDatePretty, formatTime12, computeDayAvailability } from '../../utils/bookingEngine';
import { ManualBookingModal } from './ManualBookingModal';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  RefreshCw,
  Phone,
  User,
  Plus,
} from 'lucide-react';

interface AdminAppointmentsProps {
  salon: Salon;
  appointments: Appointment[];
  staffList: Staff[];
  services: Service[];
  onUpdated?: () => void;
  onOpenReceiptViewer?: (apt: Appointment) => void;
}

export const AdminAppointments: React.FC<AdminAppointmentsProps> = ({
  salon,
  appointments,
  staffList,
  services,
  onUpdated,
  onOpenReceiptViewer,
}) => {
  const [filterTab, setFilterTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedAptDetail, setSelectedAptDetail] = useState<Appointment | null>(null);
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);

  // Reschedule Modal State (Section 28 of brief)
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('2026-09-30');
  const [newTime, setNewTime] = useState<string>('11:00');

  // Cancel Modal State
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const todayStr = '2026-09-29';

  // Filter logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (apt.salonId !== salon.id) return false;

      // Tab filter
      if (filterTab === 'today' && apt.date !== todayStr) return false;
      if (filterTab === 'upcoming' && (apt.date < todayStr || apt.status === 'completed' || apt.status === 'cancelled')) return false;
      if (filterTab === 'completed' && apt.status !== 'completed') return false;
      if (filterTab === 'cancelled' && apt.status !== 'cancelled') return false;

      // Staff filter
      if (selectedStaffFilter !== 'all' && apt.staffId !== selectedStaffFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = apt.customerName.toLowerCase().includes(q);
        const matchPhone = apt.customerWhatsapp.includes(q);
        const matchRef = apt.refCode.toLowerCase().includes(q);
        const matchService = apt.serviceName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchRef && !matchService) return false;
      }

      return true;
    });
  }, [appointments, salon.id, filterTab, selectedStaffFilter, searchQuery]);

  // Actions
  const handleMarkCompleted = (apt: Appointment) => {
    const updated: Appointment = {
      ...apt,
      status: 'completed',
    };
    StorageService.updateAppointment(updated);
    if (onUpdated) onUpdated();
    setSelectedAptDetail(null);
  };

  const handleConfirm = (apt: Appointment) => {
    StorageService.approvePayment(apt.id, 'Salon Admin');
    if (onUpdated) onUpdated();
    setSelectedAptDetail(null);
  };

  const handleCancelSubmit = () => {
    if (!cancelModalApt) return;
    const reason = cancelReason.trim() || 'Client requested cancellation.';
    const updated: Appointment = {
      ...cancelModalApt,
      status: 'cancelled',
      cancellationReason: reason,
    };
    StorageService.updateAppointment(updated);
    StorageService.logWhatsAppMessage({
      id: `wa_${Date.now()}`,
      salonId: salon.id,
      recipientPhone: cancelModalApt.customerWhatsapp,
      recipientName: cancelModalApt.customerName,
      appointmentRef: cancelModalApt.refCode,
      type: 'cancelled',
      messageText: `Hello ${cancelModalApt.customerName},\n\nYour appointment (${cancelModalApt.refCode}) has been cancelled.\nReason: ${reason}\n\nIf you wish to re-book, please visit our booking link.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'delivered',
    });
    setCancelModalApt(null);
    setCancelReason('');
    setSelectedAptDetail(null);
    if (onUpdated) onUpdated();
  };

  // Compute available slots for reschedule date
  const rescheduleDayAvailability = useMemo(() => {
    if (!rescheduleApt) return null;
    return computeDayAvailability(
      salon,
      newDate,
      staffList.filter((s) => s.active),
      appointments.filter((a) => a.id !== rescheduleApt.id),
      rescheduleApt.staffId,
      rescheduleApt.serviceDuration
    );
  }, [salon, newDate, staffList, appointments, rescheduleApt]);

  const handleRescheduleSubmit = () => {
    if (!rescheduleApt || !newTime) return;
    const [h, m] = newTime.split(':').map(Number);
    const endM = h * 60 + m + rescheduleApt.serviceDuration;
    const endTimeStr = `${Math.floor(endM / 60).toString().padStart(2, '0')}:${(endM % 60)
      .toString()
      .padStart(2, '0')}`;

    const updated: Appointment = {
      ...rescheduleApt,
      date: newDate,
      startTime: newTime,
      endTime: endTimeStr,
    };
    StorageService.updateAppointment(updated);
    StorageService.logWhatsAppMessage({
      id: `wa_${Date.now()}`,
      salonId: salon.id,
      recipientPhone: rescheduleApt.customerWhatsapp,
      recipientName: rescheduleApt.customerName,
      appointmentRef: rescheduleApt.refCode,
      type: 'payment_confirmed',
      messageText: `Hello ${rescheduleApt.customerName},\n\nYour appointment (${rescheduleApt.refCode}) has been successfully RESCHEDULED.\n\nNew Date: ${formatDatePretty(newDate)}\nNew Time: ${formatTime12(newTime)}\nService: ${rescheduleApt.serviceName}\nSpecialist: ${rescheduleApt.staffName}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'delivered',
    });
    setRescheduleApt(null);
    if (onUpdated) onUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white">Appointments Manager</h2>
          <p className="text-xs text-neutral-400">
            View, verify, reschedule, and manage customer bookings
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-48 sm:w-60"
            />
          </div>

          <select
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="all">All Specialists</option>
            {staffList.filter((s) => s.salonId === salon.id).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Manual Appointment Add Button */}
          <button
            onClick={() => setIsManualBookingOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-neutral-800/80">
        {[
          { id: 'today', label: "Today's Schedule" },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'all', label: 'All Appointments' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              filterTab === tab.id
                ? 'bg-amber-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List / Table */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-500">
            No appointments found matching this filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Customer & Service info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {apt.refCode}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : apt.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-300'
                          : apt.status === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {apt.status === 'confirmed' && 'Confirmed'}
                      {apt.status === 'completed' && 'Completed'}
                      {apt.status === 'cancelled' && 'Cancelled'}
                      {apt.status === 'pending_verification' && 'Pending Verification'}
                    </span>
                    {apt.paymentMethod === 'bank_transfer' && apt.receiptUrl && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Slip Attached
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{apt.customerName}</h4>
                    <span className="text-neutral-600">·</span>
                    <span className="text-xs text-neutral-400">{apt.serviceName}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1 font-mono text-neutral-300">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {formatDatePretty(apt.date)} at {formatTime12(apt.startTime)} ({apt.serviceDuration}m)
                    </span>
                    <span>·</span>
                    <span>Stylist: <strong className="text-neutral-300">{apt.staffName}</strong></span>
                    <span>·</span>
                    <a
                      href={`https://wa.me/${apt.customerWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                    >
                      <Phone className="w-3 h-3" />
                      {apt.customerWhatsapp}
                    </a>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800">
                  <div className="text-left md:text-right pr-2">
                    <span className="text-xs text-neutral-500 font-mono">{apt.currency}</span>
                    <span className="text-base font-bold font-mono text-white ml-1">
                      {apt.amount.toLocaleString()}
                    </span>
                    <div className="text-[10px] text-neutral-400">
                      {apt.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* View Details button */}
                    <button
                      onClick={() => setSelectedAptDetail(apt)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
                    >
                      Details
                    </button>

                    {/* Reschedule button (Section 28) */}
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setRescheduleApt(apt);
                          setNewDate(apt.date);
                          setNewTime(apt.startTime);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reschedule
                      </button>
                    )}

                    {/* Quick Confirm */}
                    {apt.status === 'pending_verification' && (
                      <button
                        onClick={() => handleConfirm(apt)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Approve
                      </button>
                    )}

                    {/* Mark Completed */}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleMarkCompleted(apt)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-emerald-950 hover:text-emerald-300 text-neutral-300 font-medium text-xs"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAptDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedAptDetail(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {selectedAptDetail.refCode}
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                {selectedAptDetail.customerName}
              </h3>
              <p className="text-xs text-neutral-400">
                Created: {selectedAptDetail.createdAt || 'Recent'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block">Service</span>
                <span className="text-white font-medium">{selectedAptDetail.serviceName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Assigned Specialist</span>
                <span className="text-white font-medium">{selectedAptDetail.staffName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Date & Time</span>
                <span className="text-white font-medium">
                  {formatDatePretty(selectedAptDetail.date)} · {formatTime12(selectedAptDetail.startTime)}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Payment Method</span>
                <span className="text-white font-medium">
                  {selectedAptDetail.paymentMethod === 'bank_transfer' ? 'Bank Slip' : 'Cash'}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Amount</span>
                <span className="text-amber-400 font-mono font-bold">
                  {selectedAptDetail.currency} {selectedAptDetail.amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">WhatsApp</span>
                <span className="font-mono text-emerald-400">{selectedAptDetail.customerWhatsapp}</span>
              </div>
            </div>

            {selectedAptDetail.customerNotes && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                <span className="text-neutral-500 block font-medium">Customer Notes:</span>
                <p className="text-neutral-300 mt-0.5">{selectedAptDetail.customerNotes}</p>
              </div>
            )}

            {selectedAptDetail.receiptUrl && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-neutral-400 font-medium">Bank Transfer Receipt Attached</span>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Ref: {selectedAptDetail.receiptRefNumber || 'N/A'}
                  </div>
                </div>
                {onOpenReceiptViewer && (
                  <button
                    onClick={() => {
                      onOpenReceiptViewer(selectedAptDetail);
                      setSelectedAptDetail(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-medium"
                  >
                    View Slip
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2">
              {selectedAptDetail.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    setCancelModalApt(selectedAptDetail);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold"
                >
                  Cancel Booking
                </button>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedAptDetail.customerWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal (Section 28 of brief) */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setRescheduleApt(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Reschedule Appointment
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                {rescheduleApt.customerName} · {rescheduleApt.serviceName}
              </h3>
              <p className="text-xs text-neutral-400">
                Current: {formatDatePretty(rescheduleApt.date)} at {formatTime12(rescheduleApt.startTime)}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Select New Date
                </label>
                <input
                  type="date"
                  min="2026-09-29"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Available Slots for {newDate}
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {rescheduleDayAvailability?.slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setNewTime(s.time)}
                      className={`p-2 rounded-lg text-xs font-mono font-medium border text-center transition-all ${
                        newTime === s.time
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                          : s.available
                          ? 'bg-neutral-950 hover:bg-neutral-800 text-white border-neutral-800'
                          : 'bg-neutral-950 text-neutral-600 border-neutral-900 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {s.formattedTime}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setRescheduleApt(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                disabled={!newTime}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs"
              >
                Confirm Reschedule & Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Modal with Reason */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              Cancel Appointment ({cancelModalApt.refCode})
            </h3>
            <p className="text-xs text-neutral-400">
              Are you sure? A cancellation notice will be drafted to {cancelModalApt.customerName}'s WhatsApp.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-300">Cancellation Reason</label>
              <input
                type="text"
                placeholder="e.g. Client requested via call, or emergency closure"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-medium"
              >
                Back
              </button>
              <button
                onClick={handleCancelSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Manual Appointment Booking Modal */}
      {isManualBookingOpen && (
        <ManualBookingModal
          salon={salon}
          staffList={staffList}
          services={services}
          appointments={appointments}
          initialDate={todayStr}
          initialTime="10:00"
          initialStaffId={selectedStaffFilter !== 'all' ? selectedStaffFilter : 'any'}
          onClose={() => setIsManualBookingOpen(false)}
          onCreated={() => {
            if (onUpdated) onUpdated();
          }}
        />
      )}
    </div>
  );
};
