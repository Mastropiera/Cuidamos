"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isToday as isDateToday,
} from "date-fns";
import { es } from "date-fns/locale";
import type { CareEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WeeklyViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: CareEvent[];
  onToggleComplete?: (eventId: string) => void;
}

interface DayData {
  date: Date;
  dateKey: string;
  events: CareEvent[];
  completedCount: number;
  pendingCount: number;
}

export function WeeklyView({
  selectedDate,
  onDateSelect,
  events,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggleComplete,
}: WeeklyViewProps) {
  // Get week start (Monday) and end (Sunday)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Build events map
  const eventsMap = useMemo(() => {
    const map = new Map<string, CareEvent[]>();

    events.forEach((event) => {
      if (!map.has(event.date)) map.set(event.date, []);
      map.get(event.date)!.push(event);
    });

    return map;
  }, [events]);

  // Build week data
  const weekDays = useMemo((): DayData[] => {
    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateKey = format(date, "yyyy-MM-dd");
      const dayEvents = eventsMap.get(dateKey) || [];

      days.push({
        date,
        dateKey,
        events: dayEvents,
        completedCount: dayEvents.filter(e => e.completed).length,
        pendingCount: dayEvents.filter(e => !e.completed).length,
      });
    }

    return days;
  }, [weekStart, eventsMap]);

  const goToPrevWeek = () => onDateSelect(subDays(selectedDate, 7));
  const goToNextWeek = () => onDateSelect(addDays(selectedDate, 7));
  const goToThisWeek = () => onDateSelect(new Date());

  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="bg-card p-4 sm:p-6 rounded-xl shadow-xl border-2 border-border">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg sm:text-xl font-bold text-primary">
            {format(weekStart, "d", { locale: es })} - {format(weekEnd, "d 'de' MMMM, yyyy", { locale: es })}
          </h2>
          {!isCurrentWeek && (
            <Button variant="ghost" size="sm" onClick={goToThisWeek} className="text-xs">
              Esta semana
            </Button>
          )}
        </div>

        <Button variant="outline" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Day headers */}
        {weekDays.map((day) => (
          <div
            key={`header-${day.dateKey}`}
            className={cn(
              "text-center text-xs sm:text-sm font-medium py-1",
              isDateToday(day.date) && "text-primary font-bold"
            )}
          >
            <div className="hidden sm:block">
              {format(day.date, "EEE", { locale: es })}
            </div>
            <div className="sm:hidden">
              {format(day.date, "EEEEE", { locale: es })}
            </div>
            <div className={cn(
              "text-lg sm:text-xl",
              isDateToday(day.date) && "text-primary"
            )}>
              {format(day.date, "d")}
            </div>
          </div>
        ))}

        {/* Day columns */}
        {weekDays.map((day) => {
          const isSelected = isSameDay(day.date, selectedDate);
          const isToday = isDateToday(day.date);

          return (
            <div
              key={day.dateKey}
              onClick={() => onDateSelect(day.date)}
              className={cn(
                "min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 rounded-lg cursor-pointer transition-all",
                "border-2 hover:border-primary/50",
                isSelected && "border-primary ring-2 ring-primary/20",
                !isSelected && "border-transparent",
                isToday && !isSelected && "bg-primary/5"
              )}
            >
              {/* Summary badges */}
              {(day.pendingCount > 0 || day.completedCount > 0) && (
                <div className="flex justify-between mb-1 text-xs">
                  {day.pendingCount > 0 && (
                    <span className="flex items-center gap-0.5 text-orange-600">
                      <Circle className="h-3 w-3" />
                      {day.pendingCount}
                    </span>
                  )}
                  {day.completedCount > 0 && (
                    <span className="flex items-center gap-0.5 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      {day.completedCount}
                    </span>
                  )}
                </div>
              )}

              {/* Events */}
              <div className="space-y-0.5">
                {day.events.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-[10px] sm:text-xs truncate px-1 rounded",
                      event.completed ? "bg-green-100 text-green-800 line-through" : "bg-orange-100 text-orange-800"
                    )}
                  >
                    {event.startTime && `${event.startTime} `}
                    {event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div className="text-[10px] sm:text-xs text-center opacity-70">
                    +{day.events.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
