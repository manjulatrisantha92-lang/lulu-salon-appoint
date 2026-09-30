import React, { useState } from 'react';
import { Salon, Appointment, Staff, Service } from '../../types/salon';
import { formatDatePretty, formatTime12 } from '../../utils/bookingEngine';
import { ManualBookingModal } from './ManualBookingModal';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Plus } from 'lucide-react';

interface AdminCalendarProps {
  salon: Salon;
  appointments: Appointment[];
  staffList: Staff[];
  services?: Service[];
  onSelectAppointment?: (apt: Appointment) => void;
  onUpdated?: () => void;
}

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
  salon,
  appointments,
  staffList,
  services = [],
  onSelectAppointment,
  onUpdated,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-09-29');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [manualSlotTime, setManualSlotTime] = useState('10:00');
  const [manualStaffId, setManualStaffId] = useState('any');

  // Navigate date
  const changeDate = (days: number) => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + days);
    const newY = dateObj.getFullYear();
    const newM = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const newD = dateObj.getDate().toString().padStart(2, '0');
    setCurrentDateStr(`${newY}-${newM}-${newD}`);
  };

  const handleOpenManualForSlot = (timeHour: number, staffId: string) => {
    const hourStr = timeHour.toString().padStart(2, '0') + ':00';
    setManualSlotTime(hourStr);
    setManualStaffId(staffId);
    setIsManualBookingOpen(true);
  };

  const dayAppointments = appointments.filter(
    (a) => a.salonId === salon.id && a.date === currentDateStr && a.status !== 'cancelled'
  );

  // Time grid slots (09:00 to 18:00)
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-400" />
            Calendar & Stylist Schedule
          </h2>
          <p className="text-xs text-neutral-400">
            Interactive day grid of assigned specialist appointments
          </p>
        </div>

        {/* Date Navigation Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-4 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs font-bold text-white flex items-center gap-2">
            <span>{formatDatePretty(currentDateStr)}</span>
            {currentDateStr === '2026-09-29' && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCurrentDateStr('2026-09-29')}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200"
          >
            Today
          </button>

          <button
            onClick={() => {
              setManualSlotTime('10:00');
              setManualStaffId('any');
              setIsManualBookingOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Booking</span>
          </button>
        </div>
      </div>

      {/* Stylist Columns Calendar Board */}
      <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Staff Headers */}
          <div className="grid grid-cols-4 gap-3 pb-3 border-b border-neutral-800 text-xs font-bold text-neutral-400">
            <div className="col-span-1">Time</div>
            {staffList
              .filter((s) => s.salonId === salon.id)
              .slice(0, 3)
              .map((staff) => (
                <div key={staff.id} className="flex items-center gap-2 text-white">
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-6 h-6 rounded-full object-cover border border-neutral-700"
                  />
                  <span className="truncate">{staff.name}</span>
                </div>
              ))}
          </div>

          {/* Hourly Rows */}
          <div className="space-y-3 pt-2">
            {hours.map((hour) => {
              const timeString = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <div
                  key={hour}
                  className="grid grid-cols-4 gap-3 py-2 border-b border-neutral-800/40 items-start min-h-[70px]"
                >
                  {/* Time label */}
                  <div className="text-xs font-mono text-neutral-500 pt-1">
                    {formatTime12(timeString)}
                  </div>

                  {/* Columns for staff */}
                  {staffList
                    .filter((s) => s.salonId === salon.id)
                    .slice(0, 3)
                    .map((staff) => {
                      // Find appointment in this hour slot for this staff
                      const apt = dayAppointments.find((a) => {
                        const aptH = parseInt(a.startTime.split(':')[0], 10);
                        return aptH === hour && a.staffId === staff.id;
                      });

                      return (
                        <div key={staff.id} className="h-full">
                          {apt ? (
                            <div
                              onClick={() => onSelectAppointment && onSelectAppointment(apt)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                                apt.paymentStatus === 'approved'
                                  ? 'bg-neutral-950 border-emerald-900/50 hover:border-emerald-500'
                                  : 'bg-amber-950/30 border-amber-900/50 hover:border-amber-500'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-white truncate">
                                  {apt.customerName}
                                </span>
                                <span className="font-mono text-[10px] text-amber-400">
                                  {formatTime12(apt.startTime)}
                                </span>
                              </div>
                              <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                                {apt.serviceName}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                                {apt.currency} {apt.amount.toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenManualForSlot(hour, staff.id)}
                              className="w-full h-full min-h-[50px] rounded-xl border border-dashed border-neutral-800/80 hover:border-amber-500/50 hover:bg-neutral-800/30 p-2 flex flex-col items-center justify-center text-[11px] text-neutral-500 hover:text-amber-300 transition-colors group"
                            >
                              <span>Available</span>
                              <span className="text-[10px] text-neutral-600 group-hover:text-amber-400 font-mono">
                                + Book
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              );
            })}
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
          initialDate={currentDateStr}
          initialTime={manualSlotTime}
          initialStaffId={manualStaffId}
          onClose={() => setIsManualBookingOpen(false)}
          onCreated={() => {
            if (onUpdated) onUpdated();
          }}
        />
      )}
    </div>
  );
};
