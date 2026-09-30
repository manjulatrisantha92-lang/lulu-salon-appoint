import React, { useState } from 'react';
import { Salon, Appointment, Service, Staff } from '../../types/salon';
import { formatDatePretty, formatTime12, computeDayAvailability } from '../../utils/bookingEngine';
import { StorageService } from '../../services/storage';
import { ManualBookingModal } from './ManualBookingModal';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  FileCheck,
  User,
  ArrowRight,
  Sparkles,
  Phone,
  Activity,
  Radio,
  Plus,
} from 'lucide-react';

interface AdminDashboardProps {
  salon: Salon;
  appointments: Appointment[];
  services: Service[];
  staffList: Staff[];
  onNavigateTab: (tabId: string) => void;
  onSelectAppointment?: (apt: Appointment) => void;
  onUpdated?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  salon,
  appointments,
  services,
  staffList,
  onNavigateTab,
  onSelectAppointment,
  onUpdated,
}) => {
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const todayStr = '2026-09-29';

  // Today's appointments
  const todayAppointments = appointments.filter(
    (a) => a.salonId === salon.id && a.date === todayStr
  );

  const activeToday = todayAppointments.filter((a) => a.status !== 'cancelled');
  const maxCapacity = salon.settings?.maxAppointmentsPerDay || 20;
  const capacityPercent = Math.min(100, Math.round((activeToday.length / maxCapacity) * 100));

  const confirmedCount = todayAppointments.filter((a) => a.status === 'confirmed').length;
  const pendingPaymentCount = appointments.filter(
    (a) => a.salonId === salon.id && a.paymentStatus === 'pending_review'
  ).length;
  const cancelledCount = todayAppointments.filter((a) => a.status === 'cancelled').length;

  const todayRevenue = todayAppointments
    .filter((a) => a.paymentStatus === 'approved')
    .reduce((sum, a) => sum + a.amount, 0);

  // Compute availability for today to show the schedule slots (including available gaps)
  const todayAvailability = computeDayAvailability(
    salon,
    todayStr,
    staffList.filter((s) => s.active),
    appointments,
    'any',
    30
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Metric */}
      <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Salon Operations Live Center
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-xs text-neutral-400">
                {salon.name} ({salon.city})
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white mt-1">Today's Schedule & Bookings</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live capacity monitoring, time slots, and payment review queue for {formatDatePretty(todayStr)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsManualBookingOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Manual Booking
            </button>
            {pendingPaymentCount > 0 && (
              <button
                onClick={() => onNavigateTab('payments')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
              >
                <FileCheck className="w-4 h-4" />
                Review {pendingPaymentCount} Pending Receipts
              </button>
            )}
            <button
              onClick={() => onNavigateTab('calendar')}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              Calendar View
            </button>
          </div>
        </div>

        {/* Section 16 Capacity Bar */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-neutral-300 font-medium">
              Today's Appointment Capacity:
            </span>
            <span className="font-mono font-bold text-white">
              <strong className="text-amber-400 text-sm">{activeToday.length}</strong> / {maxCapacity} slots
              ({capacityPercent}%)
            </span>
          </div>
          <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPercent >= 90
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Section 16: Today's Appointments 18/20, Confirmed 15, Pending Payments 3, Cancelled 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Today's Bookings</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {activeToday.length}{' '}
            <span className="text-xs font-normal text-neutral-500">/ {maxCapacity}</span>
          </div>
          <div className="text-[11px] text-neutral-500">
            {maxCapacity - activeToday.length} slots remaining today
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{confirmedCount}</div>
          <div className="text-[11px] text-emerald-500/80">Approved and notified on WhatsApp</div>
        </div>

        <div
          onClick={() => onNavigateTab('payments')}
          className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Pending Slips</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{pendingPaymentCount}</div>
          <div className="text-[11px] text-amber-500/80 flex items-center gap-1">
            <span>Needs verification</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Today's Revenue</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            <span className="text-xs text-neutral-500 font-normal mr-1">{salon.currency}</span>
            {todayRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500">Confirmed collections</div>
        </div>
      </div>

      {/* Section 16 & 17: Today's Schedule Timeline & Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Timeline */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Today's Slot Schedule
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Timeline of booked appointments and open walk-in slots
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              View Full Queue →
            </button>
          </div>

          <div className="space-y-2">
            {todayAvailability.slots.slice(0, 10).map((slot) => {
              // Find matching appointment
              const apt = todayAppointments.find(
                (a) => a.startTime === slot.time && a.status !== 'cancelled'
              );

              return (
                <div
                  key={slot.time}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    apt
                      ? apt.paymentStatus === 'approved'
                        ? 'bg-neutral-950 border-neutral-800'
                        : 'bg-amber-950/20 border-amber-900/40'
                      : 'bg-neutral-950/40 border-neutral-800/40 text-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white w-20">
                      {formatTime12(slot.time)}
                    </span>

                    {apt ? (
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{apt.customerName}</span>
                          <span className="text-[10px] text-neutral-400 font-normal">
                            ({apt.serviceName})
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                          <span>Stylist: {apt.staffName}</span>
                          <span>·</span>
                          <span className="font-mono text-amber-400">
                            {apt.currency} {apt.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-neutral-500 flex items-center gap-2">
                        <span>— Available Slot</span>
                        <span className="text-[10px] text-emerald-500/80 font-mono">Open</span>
                      </div>
                    )}
                  </div>

                  <div>
                    {apt ? (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {apt.status === 'confirmed' ? 'Confirmed' : 'Pending Slip'}
                      </span>
                    ) : (
                      <span className="text-neutral-600 font-mono text-[11px]">Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Quick Actions & Specialist Status */}
        <div className="space-y-4">
          {/* API Integration Health Status Card */}
          <div
            onClick={() => onNavigateTab('api_health')}
            className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                API Integration Health
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">WhatsApp Cloud API</h4>
                <div className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                  Webhook Status: <strong className="text-emerald-400">Connected</strong>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block font-mono uppercase">Uptime</span>
                <span className="text-base font-bold font-mono text-emerald-400">99.8%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>Ping: ~74ms</span>
              <span className="text-amber-400 flex items-center gap-1 hover:underline">
                View Health Dashboard →
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <h4 className="font-serif text-sm font-bold text-white">Quick Salon Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('qr_standee')}
                className="w-full p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs text-neutral-200 font-medium flex items-center justify-between transition-colors"
              >
                <span>Print Reception Standee QR</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                onClick={() => onNavigateTab('whatsapp')}
                className="w-full p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs text-neutral-200 font-medium flex items-center justify-between transition-colors"
              >
                <span>WhatsApp Automation Hub</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-left text-xs text-neutral-200 font-medium flex items-center justify-between transition-colors"
              >
                <span>Generate Revenue Report</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Active Stylists Today */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3">
            <h4 className="font-serif text-sm font-bold text-white">Specialists On Duty Today</h4>
            <div className="space-y-2.5">
              {staffList
                .filter((s) => s.salonId === salon.id && s.active)
                .map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80"
                  >
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-9 h-9 rounded-lg object-cover border border-neutral-700"
                    />
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-semibold text-white truncate">{staff.name}</div>
                      <div className="text-neutral-500 text-[11px] truncate">{staff.role}</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">Active</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Booking Modal */}
      {isManualBookingOpen && (
        <ManualBookingModal
          salon={salon}
          staffList={staffList}
          services={services}
          appointments={appointments}
          initialDate={todayStr}
          initialTime="10:00"
          initialStaffId="any"
          onClose={() => setIsManualBookingOpen(false)}
          onCreated={() => {
            if (onUpdated) onUpdated();
          }}
        />
      )}
    </div>
  );
};
