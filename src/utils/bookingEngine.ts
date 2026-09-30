import { Salon, Staff, Appointment } from '../types/salon';

export interface TimeSlot {
  time: string; // "09:00"
  formattedTime: string; // "09:00 AM"
  available: boolean;
  bookedBy?: string;
  reason?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
}

export interface DayCapacityStatus {
  date: string;
  dayOfWeek: number; // 0=Sun .. 6=Sat
  dayName: string;
  totalAppointments: number;
  maxAppointments: number;
  isFullyBooked: boolean;
  isClosedDay: boolean;
  isHoliday: boolean;
  holidayTitle?: string;
  isPastDate: boolean;
  slots: TimeSlot[];
}

// Convert "09:30" to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

// Convert minutes to "09:30"
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Format "09:30" to "09:30 AM"
export function formatTime12(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates day capacity and all generated time slots for a salon on a given date
 */
export function computeDayAvailability(
  salon: Salon,
  dateStr: string,
  staffList: Staff[],
  appointments: Appointment[],
  selectedStaffId: string = 'any',
  serviceDuration: number = 30
): DayCapacityStatus {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay(); // 0=Sun .. 6=Sat

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayOfWeek];

  // 1. Check if past date (compared to 2026-09-29)
  const todayStr = '2026-09-29';
  const isPastDate = dateStr < todayStr;

  // 2. Check weekly closed days
  const isClosedDay = (salon.weeklyClosedDays || []).includes(dayOfWeek);

  // 3. Check salon holidays
  const holiday = (salon.holidays || []).find((h) => h.date === dateStr);
  const isHoliday = Boolean(holiday);
  const holidayTitle = holiday?.title;

  // 4. Count appointments for this date
  const dayAppointments = appointments.filter(
    (a) => a.salonId === salon.id && a.date === dateStr && a.status !== 'cancelled'
  );
  const totalAppointments = dayAppointments.length;
  const maxAppointments = salon.settings?.maxAppointmentsPerDay || 20;

  // 5. Daily appointment limit check (Section 14 & 15 of brief)
  const isFullyBooked = salon.settings.autoBlockFullDates && totalAppointments >= maxAppointments;

  // Active staff working this day
  const activeStaffThisDay = staffList.filter(
    (s) => s.active && s.availableDays.includes(dayOfWeek)
  );

  // Generate slots
  const slots: TimeSlot[] = [];
  const openMins = timeToMinutes(salon.settings.openTime || '09:00');
  const closeMins = timeToMinutes(salon.settings.closeTime || '18:00');
  const interval = Math.max(15, salon.settings?.slotIntervalMinutes || 30);

  for (let current = openMins; current + serviceDuration <= closeMins; current += interval) {
    const slotTimeStr = minutesToTime(current);
    const slotEndMins = current + serviceDuration;

    // Check if slot overlaps with existing appointments
    if (isPastDate) {
      slots.push({
        time: slotTimeStr,
        formattedTime: formatTime12(slotTimeStr),
        available: false,
        reason: 'Past date',
      });
      continue;
    }

    if (isClosedDay) {
      slots.push({
        time: slotTimeStr,
        formattedTime: formatTime12(slotTimeStr),
        available: false,
        reason: `Closed on ${dayName}s`,
      });
      continue;
    }

    if (isHoliday) {
      slots.push({
        time: slotTimeStr,
        formattedTime: formatTime12(slotTimeStr),
        available: false,
        reason: holidayTitle || 'Salon Holiday',
      });
      continue;
    }

    if (isFullyBooked) {
      slots.push({
        time: slotTimeStr,
        formattedTime: formatTime12(slotTimeStr),
        available: false,
        reason: 'Daily capacity reached',
      });
      continue;
    }

    // Overlapping appointments check
    const overlapping = dayAppointments.filter((apt) => {
      const aptStart = timeToMinutes(apt.startTime);
      const aptEnd = timeToMinutes(apt.endTime);
      // Overlap condition: start < aptEnd && end > aptStart
      return current < aptEnd && slotEndMins > aptStart;
    });

    if (selectedStaffId && selectedStaffId !== 'any') {
      // Specific staff chosen
      const targetStaff = staffList.find((s) => s.id === selectedStaffId);
      if (!targetStaff || !targetStaff.availableDays.includes(dayOfWeek)) {
        slots.push({
          time: slotTimeStr,
          formattedTime: formatTime12(slotTimeStr),
          available: false,
          reason: 'Specialist off duty',
        });
        continue;
      }

      const staffIsBooked = overlapping.some((apt) => apt.staffId === selectedStaffId);
      if (staffIsBooked) {
        slots.push({
          time: slotTimeStr,
          formattedTime: formatTime12(slotTimeStr),
          available: false,
          reason: 'Booked',
        });
      } else {
        slots.push({
          time: slotTimeStr,
          formattedTime: formatTime12(slotTimeStr),
          available: true,
          assignedStaffId: targetStaff.id,
          assignedStaffName: targetStaff.name,
        });
      }
    } else {
      // "Any Available Staff"
      // If all active staff on duty are occupied in this slot, it's booked
      const occupiedStaffIds = new Set(overlapping.map((apt) => apt.staffId));
      const freeStaff = activeStaffThisDay.filter((s) => !occupiedStaffIds.has(s.id));

      if (freeStaff.length === 0) {
        slots.push({
          time: slotTimeStr,
          formattedTime: formatTime12(slotTimeStr),
          available: false,
          reason: 'Booked',
        });
      } else {
        slots.push({
          time: slotTimeStr,
          formattedTime: formatTime12(slotTimeStr),
          available: true,
          assignedStaffId: freeStaff[0].id,
          assignedStaffName: freeStaff[0].name,
        });
      }
    }
  }

  return {
    date: dateStr,
    dayOfWeek,
    dayName,
    totalAppointments,
    maxAppointments,
    isFullyBooked,
    isClosedDay,
    isHoliday,
    holidayTitle,
    isPastDate,
    slots,
  };
}

/**
 * Finds next available time slots on current date or future dates (Section 7 of brief)
 */
export function getNextAvailableSlots(
  dayStatus: DayCapacityStatus,
  targetTime?: string,
  limit = 4
): TimeSlot[] {
  const freeSlots = dayStatus.slots.filter((s) => s.available);
  if (!targetTime) return freeSlots.slice(0, limit);

  const targetMins = timeToMinutes(targetTime);
  const laterSlots = freeSlots.filter((s) => timeToMinutes(s.time) > targetMins);
  if (laterSlots.length > 0) {
    return laterSlots.slice(0, limit);
  }
  return freeSlots.slice(0, limit);
}

/**
 * Double booking check validation (Section 6 of brief)
 */
export function validateBookingAvailability(
  salon: Salon,
  dateStr: string,
  startTime: string,
  durationMinutes: number,
  staffId: string,
  staffList: Staff[],
  appointments: Appointment[],
  excludeAppointmentId?: string
): { canBook: boolean; reason?: string; suggestedStaff?: Staff } {
  const dayStatus = computeDayAvailability(
    salon,
    dateStr,
    staffList,
    appointments.filter((a) => a.id !== excludeAppointmentId),
    staffId,
    durationMinutes
  );

  if (dayStatus.isPastDate) return { canBook: false, reason: 'Cannot book appointments in the past.' };
  if (dayStatus.isClosedDay) return { canBook: false, reason: `The salon is closed on this day.` };
  if (dayStatus.isHoliday) return { canBook: false, reason: `Salon closed for holiday: ${dayStatus.holidayTitle}` };
  if (dayStatus.isFullyBooked) return { canBook: false, reason: `Daily limit of ${salon.settings.maxAppointmentsPerDay} appointments reached.` };

  const matchedSlot = dayStatus.slots.find((s) => s.time === startTime);
  if (!matchedSlot) {
    return { canBook: false, reason: 'Requested time slot is outside salon working hours.' };
  }

  if (!matchedSlot.available) {
    return { canBook: false, reason: matchedSlot.reason || 'This time slot is already booked.' };
  }

  const assigned = staffList.find((s) => s.id === matchedSlot.assignedStaffId);
  return { canBook: true, suggestedStaff: assigned };
}
