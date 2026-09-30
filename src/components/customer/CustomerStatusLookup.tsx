import React, { useState } from 'react';
import { Appointment, Salon } from '../../types/salon';
import { formatDatePretty, formatTime12 } from '../../utils/bookingEngine';
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, MessageSquare, ArrowLeft } from 'lucide-react';

interface CustomerStatusLookupProps {
  initialRefCode?: string;
  salon: Salon;
  appointments: Appointment[];
  onClose: () => void;
}

export const CustomerStatusLookup: React.FC<CustomerStatusLookupProps> = ({
  initialRefCode = '',
  salon,
  appointments,
  onClose,
}) => {
  const [refQuery, setRefQuery] = useState(initialRefCode);
  const [foundAppointment, setFoundAppointment] = useState<Appointment | null>(() => {
    if (initialRefCode) {
      return appointments.find((a) => a.refCode.toLowerCase() === initialRefCode.toLowerCase()) || null;
    }
    return null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialRefCode));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = refQuery.trim().toLowerCase();
    const match = appointments.find(
      (a) => a.refCode.toLowerCase() === cleaned || a.customerWhatsapp.includes(cleaned)
    );
    setFoundAppointment(match || null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white text-sm font-bold w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-amber-400" />
          <h3 className="font-serif text-lg font-bold text-white">Track Your Appointment</h3>
        </div>
        <p className="text-xs text-neutral-400 mb-5">
          Enter your booking reference code (e.g. <code>WCS-8923</code>) or WhatsApp number to check real-time approval status.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="e.g. WCS-8923 or +9477..."
            value={refQuery}
            onChange={(e) => setRefQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors"
          >
            Track
          </button>
        </form>

        {hasSearched && (
          <div>
            {foundAppointment ? (
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">
                      {foundAppointment.refCode}
                    </span>
                    <h4 className="text-sm font-bold text-white">{foundAppointment.customerName}</h4>
                  </div>

                  <span
                    className={`text-xs font-mono px-2.5 py-1 rounded-full font-semibold ${
                      foundAppointment.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : foundAppointment.status === 'cancelled'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {foundAppointment.status === 'confirmed' && '✓ Confirmed'}
                    {foundAppointment.status === 'pending_verification' && '⏳ Payment Under Review'}
                    {foundAppointment.status === 'cancelled' && '✕ Cancelled / Rejected'}
                    {foundAppointment.status === 'completed' && '✓ Completed'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Service:</span>
                    <span className="text-white font-medium">{foundAppointment.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Specialist:</span>
                    <span className="text-white font-medium">{foundAppointment.staffName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Date & Time:</span>
                    <span className="text-white font-medium">
                      {formatDatePretty(foundAppointment.date)} at {formatTime12(foundAppointment.startTime)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Amount:</span>
                    <span className="text-amber-400 font-mono font-bold">
                      {foundAppointment.currency} {foundAppointment.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {foundAppointment.receiptUrl && (
                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Payment Receipt Slip:</span>
                    <span className="font-mono text-emerald-400">
                      Uploaded (Ref: {foundAppointment.receiptRefNumber || 'N/A'})
                    </span>
                  </div>
                )}

                {foundAppointment.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200">
                    <strong>Admin Note:</strong> {foundAppointment.rejectionReason}
                  </div>
                )}

                {foundAppointment.status === 'confirmed' && (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Your appointment is confirmed! Please arrive 5 minutes early.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-400 text-xs">
                <AlertCircle className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                No appointment found with code "{refQuery}". Please check your reference number.
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
