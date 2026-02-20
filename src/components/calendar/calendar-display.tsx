"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { startOfMonth, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Shift } from "@/lib/types";

interface CalendarDisplayProps {
  selectedDate: Date | undefined;
  onDateSelect: (date?: Date) => void;
  shifts?: Shift[];
  selectedPatientId?: string | null;
  onMonthChange?: (month: Date) => void;
}

export default function CalendarDisplay({
  selectedDate,
  onDateSelect,
  shifts = [],
  selectedPatientId,
  onMonthChange,
}: CalendarDisplayProps) {
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    selectedDate ? startOfMonth(selectedDate) : startOfMonth(new Date())
  );

  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(currentCalendarMonth);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCalendarMonth]);

  // Filter shifts by patient if selected
  const filteredShifts = useMemo(() => {
    if (!selectedPatientId) return shifts;
    return shifts.filter((s) => s.patientId === selectedPatientId);
  }, [shifts, selectedPatientId]);

  // Map shifts by day for modifiers
  const daysWithShifts = useMemo(() => {
    const dates: Date[] = [];
    const seen = new Set<string>();
    filteredShifts.forEach((s) => {
      if (!seen.has(s.date)) {
        seen.add(s.date);
        const [year, month, day] = s.date.split('-').map(Number);
        dates.push(new Date(year, month - 1, day));
      }
    });
    return dates;
  }, [filteredShifts]);

  return (
    <div className="bg-card p-4 sm:p-6 rounded-xl shadow-xl border-2 border-border">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => onDateSelect(date ? startOfDay(date) : undefined)}
        month={currentCalendarMonth}
        onMonthChange={setCurrentCalendarMonth}
        locale={es}
        className="w-full"
        modifiers={{
          hasShifts: daysWithShifts,
        }}
        modifiersClassNames={{
          hasShifts: "bg-primary/10 ring-2 ring-primary/30 ring-inset",
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
          month: "space-y-4 w-full",
          caption_label: "text-xl font-bold text-primary",
          button_previous: "h-8 w-8",
          button_next: "h-8 w-8",
          weekdays: "flex w-full",
          weekday: "w-full h-10 text-muted-foreground font-normal text-sm",
          week: "flex w-full mt-2",
          day: "h-12 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day_button: "h-12 w-full p-0 font-normal aria-selected:opacity-100 rounded-md",
          selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          today: "font-bold ring-2 ring-primary/50",
          outside: "text-muted-foreground opacity-50",
        }}
        showOutsideDays
      />
    </div>
  );
}
