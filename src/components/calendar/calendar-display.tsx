"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { startOfMonth, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { CareEvent } from "@/lib/types";

interface CalendarDisplayProps {
  selectedDate: Date | undefined;
  onDateSelect: (date?: Date) => void;
  events?: CareEvent[];
  onMonthChange?: (month: Date) => void;
}

export default function CalendarDisplay({
  selectedDate,
  onDateSelect,
  events = [],
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

  // Mapear eventos por día
  const dayEvents = useMemo(() => {
    const map = new Map<string, CareEvent[]>();

    events.forEach((event) => {
      if (!map.has(event.date)) map.set(event.date, []);
      map.get(event.date)!.push(event);
    });

    return map;
  }, [events]);

  // Días con eventos para modificar el estilo
  const daysWithEvents = useMemo(() => {
    const dates: Date[] = [];
    dayEvents.forEach((_, dateKey) => {
      const [year, month, day] = dateKey.split('-').map(Number);
      dates.push(new Date(year, month - 1, day));
    });
    return dates;
  }, [dayEvents]);

  // Días con tareas pendientes
  const daysWithPending = useMemo(() => {
    const dates: Date[] = [];
    dayEvents.forEach((evts, dateKey) => {
      if (evts.some(e => !e.completed)) {
        const [year, month, day] = dateKey.split('-').map(Number);
        dates.push(new Date(year, month - 1, day));
      }
    });
    return dates;
  }, [dayEvents]);

  // Días con todas las tareas completadas
  const daysAllCompleted = useMemo(() => {
    const dates: Date[] = [];
    dayEvents.forEach((evts, dateKey) => {
      if (evts.length > 0 && evts.every(e => e.completed)) {
        const [year, month, day] = dateKey.split('-').map(Number);
        dates.push(new Date(year, month - 1, day));
      }
    });
    return dates;
  }, [dayEvents]);

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
          hasEvents: daysWithEvents,
          hasPending: daysWithPending,
          allCompleted: daysAllCompleted,
        }}
        modifiersClassNames={{
          hasEvents: "bg-primary/10",
          hasPending: "ring-2 ring-orange-400 ring-inset",
          allCompleted: "ring-2 ring-green-400 ring-inset",
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
          month: "space-y-4 w-full",
          caption_label: "text-xl font-bold text-primary",
          nav_button: "h-8 w-8",
          head_cell: "w-full h-10 text-muted-foreground font-normal text-sm",
          row: "flex w-full mt-2",
          cell: "h-12 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 rounded-md",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "font-bold ring-2 ring-primary/50",
          day_outside: "text-muted-foreground opacity-50",
        }}
        showOutsideDays
        ISOWeek={false}
      />
    </div>
  );
}
