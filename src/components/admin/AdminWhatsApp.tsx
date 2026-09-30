import React, { useState } from 'react';
import { Salon, WhatsAppMessageLog } from '../../types/salon';
import { StorageService } from '../../services/storage';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  Activity,
} from 'lucide-react';

interface AdminWhatsAppProps {
  salon: Salon;
  logs: WhatsAppMessageLog[];
  onUpdated?: () => void;
  onNavigateToHealth?: () => void;
}

export const AdminWhatsApp: React.FC<AdminWhatsAppProps> = ({
  salon,
  logs,
  onUpdated,
  onNavigateToHealth,
}) => {
  const [phoneNumberId, setPhoneNumberId] = useState(salon.whatsappConfig?.phoneNumberId || '10984920491823');
  const [businessAccountId, setBusinessAccountId] = useState(salon.whatsappConfig?.businessAccountId || 'WABA_ABC_COLOMBO_01');
  const [senderNumber, setSenderNumber] = useState(salon.whatsappConfig?.senderPhoneNumber || salon.whatsapp);
  const [accessToken, setAccessToken] = useState('EAANQ9821...hidden_token');

  // Simulator test message state
  const [testRecipient, setTestRecipient] = useState('+94 77 123 4567');
  const [testTemplate, setTestTemplate] = useState('payment_confirmed');
  const [testSentSuccess, setTestSentSuccess] = useState(false);

  const salonLogs = logs.filter((l) => l.salonId === salon.id);

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    let msg = '';
    if (testTemplate === 'payment_confirmed') {
      msg = `Hello Kamal,\n\nYour salon appointment has been confirmed! ✨\n\nSalon: ${salon.name}\nService: Hair Cut & Styling\nSpecialist: Kamal Silva\nDate: 29 September 2026\nTime: 09:00 AM\nAmount: Rs. 1,500\nPayment: Confirmed (Ref: TXN-902148)\n\nThank you for choosing ${salon.name}. Please arrive 5 minutes early.`;
    } else if (testTemplate === 'reminder_24h') {
      msg = `Hello Kamal,\n\nReminder: Your appointment is scheduled for tomorrow at 09:00 AM at ${salon.name}.\n\nService: Hair Cut & Styling\nSpecialist: Kamal Silva\n\nNeed to reschedule? Please reply to this message.`;
    } else {
      msg = `Hello Kamal,\n\nWe received your salon appointment request at ${salon.name}. Your payment receipt is currently under review by our admin team.`;
    }

    StorageService.logWhatsAppMessage({
      id: `wa_${Date.now()}`,
      salonId: salon.id,
      recipientPhone: testRecipient,
      recipientName: 'Kamal Perera',
      appointmentRef: 'WCS-TEST-99',
      type: testTemplate as any,
      messageText: msg,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'delivered',
    });

    setTestSentSuccess(true);
    setTimeout(() => setTestSentSuccess(false), 3000);
    if (onUpdated) onUpdated();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            WhatsApp Automation & Notification Hub
          </h2>
          <p className="text-xs text-neutral-400">
            Official Meta WhatsApp Cloud API integration for automated customer receipts and reminders
          </p>
        </div>

        {onNavigateToHealth && (
          <button
            onClick={onNavigateToHealth}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-neutral-800 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Webhook Connection Health & Logs →
          </button>
        )}
      </div>

      {/* Grid: Cloud API Config & Test Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Cloud API Configuration Panel */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              WhatsApp Cloud API Credentials
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              ● Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-neutral-400 mb-1">WhatsApp Sender Number</label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Phone Number ID</label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">WhatsApp Business Account ID</label>
              <input
                type="text"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Permanent System User Token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400">
              ⚡ All approval actions in Payment Verification immediately trigger automated WhatsApp delivery via webhook.
            </div>
          </div>
        </div>

        {/* Live Test Sender Simulator */}
        <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" />
              Live Message Dispatcher Simulator
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Send a test automated notification to any phone number
            </p>

            <form onSubmit={handleSendTestMessage} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1">Recipient WhatsApp Number</label>
                <input
                  type="text"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Message Template</label>
                <select
                  value={testTemplate}
                  onChange={(e) => setTestTemplate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
                >
                  <option value="payment_confirmed">Payment Confirmed & Slot Reserved (Section 12)</option>
                  <option value="reminder_24h">24-Hour Appointment Reminder (Section 28)</option>
                  <option value="booking_received">Payment Slip Received (Under Review)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Test WhatsApp Message
                </button>

                {testSentSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered!
                  </span>
                )}
              </div>
            </form>
          </div>

          <div className="pt-3 border-t border-neutral-800">
            <a
              href={`https://wa.me/${testRecipient.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              <span>Open in WhatsApp Web client</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Outgoing WhatsApp Logs History */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400" />
          Recent Outgoing WhatsApp Message Logs ({salonLogs.length})
        </h3>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {salonLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{log.recipientName}</span>
                  <span className="font-mono text-neutral-400">{log.recipientPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-neutral-500">{log.timestamp}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    ✓ {log.status}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {log.messageText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
