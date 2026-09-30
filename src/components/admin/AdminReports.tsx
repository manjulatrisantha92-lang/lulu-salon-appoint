import React, { useState, useMemo } from 'react';
import { Salon, Appointment, Service, Staff } from '../../types/salon';
import { formatDatePretty } from '../../utils/bookingEngine';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  PieChart,
  Users,
  Award,
} from 'lucide-react';

interface AdminReportsProps {
  salon: Salon;
  appointments: Appointment[];
  services: Service[];
  staffList: Staff[];
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  salon,
  appointments,
  services,
  staffList,
}) => {
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'month'>('all');

  const salonAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (a.salonId !== salon.id) return false;
      if (dateRange === 'today' && a.date !== '2026-09-29') return false;
      if (dateRange === 'month' && !a.date.startsWith('2026-09')) return false;
      return true;
    });
  }, [appointments, salon.id, dateRange]);

  const totalRevenue = salonAppointments
    .filter((a) => a.paymentStatus === 'approved')
    .reduce((sum, a) => sum + a.amount, 0);

  const completedCount = salonAppointments.filter((a) => a.status === 'completed' || a.status === 'confirmed').length;
  const pendingCount = salonAppointments.filter((a) => a.paymentStatus === 'pending_review').length;
  const cancelledCount = salonAppointments.filter((a) => a.status === 'cancelled').length;

  // Service breakdown
  const serviceBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number }>();
    salonAppointments
      .filter((a) => a.status !== 'cancelled')
      .forEach((apt) => {
        const item = map.get(apt.serviceName) || { name: apt.serviceName, count: 0, revenue: 0 };
        item.count += 1;
        item.revenue += apt.amount;
        map.set(apt.serviceName, item);
      });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [salonAppointments]);

  // Staff breakdown
  const staffBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number }>();
    salonAppointments
      .filter((a) => a.status !== 'cancelled')
      .forEach((apt) => {
        const item = map.get(apt.staffName) || { name: apt.staffName, count: 0, revenue: 0 };
        item.count += 1;
        item.revenue += apt.amount;
        map.set(apt.staffName, item);
      });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [salonAppointments]);

  // Export CSV
  const exportCsv = () => {
    const headers = 'Reference,Customer,WhatsApp,Service,Specialist,Date,Time,Amount,Status,Payment\n';
    const rows = salonAppointments
      .map(
        (a) =>
          `"${a.refCode}","${a.customerName}","${a.customerWhatsapp}","${a.serviceName}","${a.staffName}","${a.date}","${a.startTime}",${a.amount},"${a.status}","${a.paymentStatus}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${salon.slug}-appointments-report.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Salon Revenue & Appointment Analytics
          </h2>
          <p className="text-xs text-neutral-400">
            Financial ledger, service performance, and staff distribution metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200"
          >
            <option value="all">All-Time Report</option>
            <option value="month">Current Month (Sep 2026)</option>
            <option value="today">Today Only (29 Sep)</option>
          </select>

          <button
            onClick={exportCsv}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400">Total Confirmed Revenue</div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            <span className="text-xs text-neutral-500 mr-1">{salon.currency}</span>
            {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500">From verified payments</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400">Bookings Completed / Active</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{completedCount}</div>
          <div className="text-[11px] text-emerald-500/80">Active clients served</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400">Pending Review Slips</div>
          <div className="text-2xl font-bold font-mono text-amber-300">{pendingCount}</div>
          <div className="text-[11px] text-amber-500/80">Pending admin approval</div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="text-xs text-neutral-400">Cancelled Bookings</div>
          <div className="text-2xl font-bold font-mono text-neutral-400">{cancelledCount}</div>
          <div className="text-[11px] text-neutral-500">Cancelled or rejected slips</div>
        </div>
      </div>

      {/* Tables: Top Services & Staff Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Top Services by Revenue
          </h3>

          <div className="space-y-3">
            {serviceBreakdown.map((srv, idx) => (
              <div
                key={srv.name}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-neutral-500 w-4 font-bold">{idx + 1}.</span>
                  <div>
                    <div className="font-semibold text-white">{srv.name}</div>
                    <div className="text-[11px] text-neutral-500">{srv.count} bookings</div>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-amber-400">
                  {salon.currency} {srv.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
          <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Stylist Booking Volume
          </h3>

          <div className="space-y-3">
            {staffBreakdown.map((stf, idx) => (
              <div
                key={stf.name}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-neutral-500 w-4 font-bold">{idx + 1}.</span>
                  <div>
                    <div className="font-semibold text-white">{stf.name}</div>
                    <div className="text-[11px] text-neutral-500">{stf.count} clients scheduled</div>
                  </div>
                </div>

                <div className="text-right font-mono text-neutral-300">
                  {salon.currency} {stf.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
