"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Shift } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DailyViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  shifts: Shift[];
  highlightMemberId?: string;
}

export function DailyView({
  selectedDate,
  onDateChange,
  shifts,
  highlightMemberId,
}: DailyViewProps) {
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDate, new Date());

  const dayShifts = useMemo(() => {
    return shifts
      .filter((s) => s.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [shifts, dateKey]);

  const goToPrevDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));
  const goToToday = () => onDateChange(startOfDay(new Date()));

  return (
    <div className="bg-card p-4 sm:p-6 rounded-xl shadow-xl border-2 border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" onClick={goToPrevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg sm:text-xl font-bold text-primary capitalize">
            {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </h2>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
              Ir a hoy
            </Button>
          )}
        </div>

        <Button variant="outline" size="icon" onClick={goToNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Shifts list */}
      <div className="space-y-2">
        {dayShifts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay turnos para este dia</p>
          </div>
        )}

        {dayShifts.map((shift) => {
          const isHighlighted = highlightMemberId === shift.cuidadoraId;
          return (
            <div
              key={shift.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                isHighlighted
                  ? "ring-2 ring-primary/30 bg-primary/5"
                  : "bg-muted/30"
              )}
            >
              <div
                className="w-3 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: shift.cuidadoraColor }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{shift.patientName}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {shift.cuidadoraName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
