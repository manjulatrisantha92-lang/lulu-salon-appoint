import React, { useState } from 'react';
import { Appointment, Salon } from '../../types/salon';
import { StorageService } from '../../services/storage';
import { formatDatePretty, formatTime12 } from '../../utils/bookingEngine';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  AlertTriangle,
  ZoomIn,
  Building,
  User,
  Phone,
  FileCheck,
} from 'lucide-react';

interface AdminPaymentReviewProps {
  salon: Salon;
  appointments: Appointment[];
  onUpdated?: () => void;
}

export const AdminPaymentReview: React.FC<AdminPaymentReviewProps> = ({
  salon,
  appointments,
  onUpdated,
}) => {
  const [selectedReceiptApt, setSelectedReceiptApt] = useState<Appointment | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [zoomReceipt, setZoomReceipt] = useState<boolean>(false);

  // Filter appointments with receipts or pending review
  const pendingReviewList = appointments.filter(
    (a) => a.salonId === salon.id && a.paymentStatus === 'pending_review'
  );

  const approvedList = appointments.filter(
    (a) => a.salonId === salon.id && a.paymentStatus === 'approved' && a.receiptUrl
  );

  const rejectedList = appointments.filter(
    (a) => a.salonId === salon.id && a.paymentStatus === 'rejected'
  );

  const handleApprove = (apt: Appointment) => {
    StorageService.approvePayment(apt.id, 'Salon Admin');
    setSelectedReceiptApt(null);
    if (onUpdated) onUpdated();
  };

  const handleRejectSubmit = () => {
    if (!selectedReceiptApt) return;
    const reason = rejectionReason.trim() || 'Payment receipt could not be verified by bank statement.';
    StorageService.rejectPayment(selectedReceiptApt.id, reason);
    setRejectModalOpen(false);
    setRejectionReason('');
    setSelectedReceiptApt(null);
    if (onUpdated) onUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            Payment Receipts & Slip Verification
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Review customer bank deposit slips, verify against accounts, and approve/reject bookings
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold">
            {pendingReviewList.length} Pending Review
          </span>
        </div>
      </div>

      {/* Pending Reviews Queue */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Pending Verification Queue ({pendingReviewList.length})
        </h3>

        {pendingReviewList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            All payment receipts have been verified! No pending receipts in queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReviewList.map((apt) => (
              <div
                key={apt.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {apt.refCode}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        Pending Review
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">{apt.customerName}</h4>
                    <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {apt.customerWhatsapp}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-500 font-mono">{apt.currency}</span>
                    <span className="text-lg font-bold font-mono text-white ml-1">
                      {apt.amount.toLocaleString()}
                    </span>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{apt.serviceName}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="text-neutral-400">
                      Slot: <strong>{formatDatePretty(apt.date)}</strong> at {formatTime12(apt.startTime)}
                    </div>
                    <div className="text-neutral-500 text-[11px]">
                      Specialist: {apt.staffName} · Uploaded: {apt.receiptUploadedAt || 'Today'}
                    </div>
                  </div>

                  {apt.receiptUrl && (
                    <button
                      onClick={() => setSelectedReceiptApt(apt)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      View Slip
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(apt)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Payment
                  </button>

                  <button
                    onClick={() => {
                      setSelectedReceiptApt(apt);
                      setRejectModalOpen(true);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-rose-950 hover:text-rose-300 text-neutral-300 font-semibold text-xs transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previously Approved & Rejected Slips History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* Recent Approved */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Recently Approved Slips ({approvedList.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {approvedList.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{a.customerName}</div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    {a.refCode} · {a.currency} {a.amount.toLocaleString()} · Verified by {a.verifiedBy}
                  </div>
                </div>
                {a.receiptUrl && (
                  <button
                    onClick={() => setSelectedReceiptApt(a)}
                    className="text-amber-400 hover:text-amber-300 text-xs font-mono"
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rejected */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-400" />
            Rejected Slips ({rejectedList.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {rejectedList.length === 0 ? (
              <div className="text-neutral-500 text-xs py-4 text-center">No rejected slips</div>
            ) : (
              rejectedList.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{a.customerName}</span>
                    <span className="text-[10px] text-rose-400 font-mono">Rejected</span>
                  </div>
                  <div className="text-[11px] text-rose-300">Reason: {a.rejectionReason}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Receipt Modal Viewer (Sections 10 & 11 of brief) */}
      {selectedReceiptApt && !rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedReceiptApt(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Payment Verification Review
              </span>
              <h3 className="text-lg font-serif font-bold text-white">
                Receipt Slip: {selectedReceiptApt.customerName}
              </h3>
              <p className="text-xs text-neutral-400">
                Ref: {selectedReceiptApt.refCode} · Amount: {selectedReceiptApt.currency}{' '}
                {selectedReceiptApt.amount.toLocaleString()}
              </p>
            </div>

            {/* Receipt Preview */}
            <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800 flex flex-col items-center justify-center overflow-hidden max-h-96">
              {selectedReceiptApt.receiptUrl ? (
                <img
                  src={selectedReceiptApt.receiptUrl}
                  alt="Customer Transfer Slip"
                  className={`rounded-xl object-contain transition-all ${
                    zoomReceipt ? 'scale-125 cursor-zoom-out' : 'max-h-72 cursor-zoom-in'
                  }`}
                  onClick={() => setZoomReceipt(!zoomReceipt)}
                />
              ) : (
                <div className="py-12 text-neutral-500 text-xs">No image attached</div>
              )}
            </div>

            <div className="text-xs text-neutral-400 flex items-center justify-between font-mono">
              <span>Slip Ref: {selectedReceiptApt.receiptRefNumber || 'N/A'}</span>
              <span>Uploaded: {selectedReceiptApt.receiptUploadedAt || 'N/A'}</span>
            </div>

            {/* Actions */}
            {selectedReceiptApt.paymentStatus === 'pending_review' && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleApprove(selectedReceiptApt)}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Slip & Send WhatsApp Confirmation
                </button>
                <button
                  onClick={() => setRejectModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-rose-950 hover:text-rose-300 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Reject Slip
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Slip Modal with Reason Input */}
      {rejectModalOpen && selectedReceiptApt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Reject Payment Slip
            </h3>
            <p className="text-xs text-neutral-400">
              Provide a clear reason. The customer will be informed via automated WhatsApp notification to submit a valid transfer.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-neutral-300">Rejection Reason</label>
              <textarea
                rows={3}
                placeholder="e.g. Deposit amount does not match service price, or transaction ID not found in bank feed."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium"
              >
                Back
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
