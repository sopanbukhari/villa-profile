import React, { useState, useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  getDay,
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OccupiedDatesResponse } from '../../types';

interface AvailabilityCalendarProps {
  checkIn: string;
  checkOut: string;
  onSelectDates: (checkIn: string, checkOut: string) => void;
  occupiedData?: OccupiedDatesResponse;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  checkIn,
  checkOut,
  onSelectDates,
  occupiedData,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const today = useMemo(() => startOfDay(new Date()), []);

  const selectedInDate = useMemo(
    () => (checkIn ? new Date(`${checkIn}T00:00:00`) : null),
    [checkIn]
  );
  const selectedOutDate = useMemo(
    () => (checkOut ? new Date(`${checkOut}T00:00:00`) : null),
    [checkOut]
  );

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Leading empty days for Sunday start
  const leadingBlanks = useMemo(() => {
    const startDay = getDay(startOfMonth(currentMonth));
    return Array.from({ length: startDay });
  }, [currentMonth]);

  // Determine if a specific day is occupied for staying overnight
  // Note BR-008: A guest checks in at check-in date and checks out at check-out date.
  // Overnight stay is for days in [check_in, check_out - 1 day].
  const getDayStatus = (day: Date) => {
    const dayTime = day.getTime();

    // 1. Past dates
    if (isBefore(day, today)) {
      return { status: 'PAST', reason: 'Tanggal lampau' };
    }

    if (!occupiedData) return { status: 'AVAILABLE' };

    // 2. Confirmed or Active Pending Bookings
    for (const b of occupiedData.bookings) {
      const bIn = new Date(`${b.checkIn}T00:00:00`).getTime();
      const bOut = new Date(`${b.checkOut}T00:00:00`).getTime();
      // Occupied overnight from bIn to bOut - 1
      if (dayTime >= bIn && dayTime < bOut) {
        return {
          status: b.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
          reason: b.status === 'CONFIRMED' ? 'Sudah Terisi' : 'Dalam Hold',
        };
      }
    }

    // 3. Admin Blocked Dates
    for (const blk of occupiedData.blockedDates) {
      const blkIn = new Date(`${blk.startDate}T00:00:00`).getTime();
      const blkOut = new Date(`${blk.endDate}T00:00:00`).getTime();
      if (dayTime >= blkIn && dayTime < blkOut) {
        return { status: 'BLOCKED', reason: blk.reason || 'Ditutup oleh Villa' };
      }
    }

    return { status: 'AVAILABLE' };
  };

  const handleDateClick = (day: Date) => {
    const status = getDayStatus(day);
    if (status.status === 'PAST') return;

    // Check if clicking to select check-in
    if (!selectedInDate || (selectedInDate && selectedOutDate)) {
      // Cannot start check-in on an occupied night
      if (status.status !== 'AVAILABLE') return;
      onSelectDates(format(day, 'yyyy-MM-dd'), '');
      return;
    }

    // Selecting check-out
    if (selectedInDate && !selectedOutDate) {
      if (isSameDay(day, selectedInDate) || isBefore(day, selectedInDate)) {
        // Reset check-in to this day if valid
        if (status.status === 'AVAILABLE') {
          onSelectDates(format(day, 'yyyy-MM-dd'), '');
        }
        return;
      }

      // Check if there are any blocked/confirmed dates between selectedInDate and day
      let intervalBlocked = false;
      const intervalDays = eachDayOfInterval({
        start: selectedInDate,
        end: new Date(day.getTime() - 24 * 60 * 60 * 1000), // Check-out day itself can be check-in for next
      });

      for (const d of intervalDays) {
        const s = getDayStatus(d);
        if (s.status !== 'AVAILABLE') {
          intervalBlocked = true;
          break;
        }
      }

      if (intervalBlocked) {
        alert('Rentang tanggal yang dipilih memiliki tanggal yang tidak tersedia. Silakan pilih rentang lain.');
        return;
      }

      onSelectDates(format(selectedInDate, 'yyyy-MM-dd'), format(day, 'yyyy-MM-dd'));
    }
  };

  const isDateSelected = (day: Date) => {
    if (selectedInDate && isSameDay(day, selectedInDate)) return 'START';
    if (selectedOutDate && isSameDay(day, selectedOutDate)) return 'END';
    if (
      selectedInDate &&
      selectedOutDate &&
      isAfter(day, selectedInDate) &&
      isBefore(day, selectedOutDate)
    ) {
      return 'RANGE';
    }
    return null;
  };

  const weekDayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#ede0c7] max-w-xl mx-auto">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-cream-200">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-forest-950 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">Timezone: Asia/Jakarta (WIB)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-cream-100 text-stone-700 transition-colors"
            title="Bulan sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-full hover:bg-cream-100 text-stone-700 transition-colors"
            title="Bulan berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Day Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDayNames.map((name, i) => (
          <div
            key={name}
            className={`text-xs font-semibold uppercase tracking-wider py-1 ${
              i === 0 || i === 6 ? 'text-forest-800' : 'text-stone-500'
            }`}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {leadingBlanks.map((_, index) => (
          <div key={`blank-${index}`} className="h-10 sm:h-12" />
        ))}

        {daysInMonth.map((day) => {
          const { status, reason } = getDayStatus(day);
          const selection = isDateSelected(day);
          const isPast = status === 'PAST';
          const isOccupied = status !== 'AVAILABLE' && !isPast;

          let btnClass = 'text-stone-800 hover:bg-cream-200 hover:scale-105';

          if (isPast) {
            btnClass = 'text-stone-300 bg-stone-50 cursor-not-allowed opacity-50';
          } else if (selection === 'START' || selection === 'END') {
            btnClass = 'bg-forest-900 text-white font-bold shadow-md scale-105 ring-2 ring-forest-600';
          } else if (selection === 'RANGE') {
            btnClass = 'bg-cream-300/80 text-forest-950 font-semibold rounded-none';
          } else if (isOccupied) {
            if (status === 'CONFIRMED') {
              btnClass = 'bg-rose-50 text-rose-400 line-through cursor-not-allowed border border-rose-200/50';
            } else if (status === 'PENDING') {
              btnClass = 'bg-amber-50 text-amber-500 cursor-not-allowed border border-amber-200/50';
            } else {
              btnClass = 'bg-stone-100 text-stone-400 line-through cursor-not-allowed';
            }
          }

          return (
            <button
              key={day.toISOString()}
              disabled={isPast || (isOccupied && !selectedInDate)}
              onClick={() => handleDateClick(day)}
              title={isOccupied ? `${format(day, 'dd/MM/yyyy')}: ${reason}` : format(day, 'dd MMMM yyyy')}
              className={`h-10 sm:h-12 w-full rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center relative ${btnClass}`}
            >
              <span>{format(day, 'd')}</span>
              {isOccupied && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    status === 'CONFIRMED'
                      ? 'bg-rose-500'
                      : status === 'PENDING'
                      ? 'bg-amber-500'
                      : 'bg-stone-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend & Help Notes */}
      <div className="mt-8 pt-5 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-forest-900" />
          <span>Dipilih</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white border border-stone-300" />
          <span>Tersedia</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Hold / Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Terisi / Dipesan</span>
        </div>
      </div>
    </div>
  );
};
