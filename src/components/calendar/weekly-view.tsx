"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import type { Shift, Patient } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WeeklyViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  shifts: Shift[];
  patients: Patient[];
  highlightMemberId?: string;
}

export function WeeklyView({
  selectedDate,
  onDateSelect,
  shifts,
  patients,
  highlightMemberId,
}: WeeklyViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Build week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(weekStart, i));
    }
    return dates;
  }, [weekStart]);

  // Build shifts map: date -> shifts[]
  const shiftsMap = useMemo(() => {
    const map = new Map<string, Shift[]>();
    shifts.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    });
    return map;
  }, [shifts]);

  const activePatients = patients.filter((p) => p.active);

  const goToPrevWeek = () => onDateSelect(subDays(selectedDate, 7));
  const goToNextWeek = () => onDateSelect(addDays(selectedDate, 7));
  const goToThisWeek = () => onDateSelect(new Date());

  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="bg-card p-4 sm:p-6 rounded-xl shadow-xl border-2 border-border">
      {/* Header */}
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

      {/* Grid: patients x days */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 font-medium text-muted-foreground min-w-[120px]">
                Paciente
              </th>
              {weekDates.map((date) => {
                const isToday = isDateToday(date);
                return (
                  <th
                    key={date.toISOString()}
                    className={cn(
                      "text-center p-2 font-medium min-w-[80px]",
                      isToday && "text-primary"
                    )}
                  >
                    <div className="text-xs">
                      {format(date, "EEE", { locale: es })}
                    </div>
                    <div className={cn("text-base", isToday && "font-bold")}>
                      {format(date, "d")}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activePatients.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="p-2 font-medium text-sm">{patient.name}</td>
                {weekDates.map((date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const dayShifts = (shiftsMap.get(dateKey) || []).filter(
                    (s) => s.patientId === patient.id
                  );

                  return (
                    <td
                      key={dateKey}
                      className="p-1 text-center cursor-pointer"
                      onClick={() => onDateSelect(date)}
                    >
                      {dayShifts.map((s) => (
                        <div
                          key={s.id}
                          className={cn(
                            "text-[10px] sm:text-xs rounded px-1 py-0.5 mb-0.5 text-white truncate",
                            highlightMemberId === s.cuidadoraId && "ring-2 ring-foreground"
                          )}
                          style={{ backgroundColor: s.cuidadoraColor }}
                          title={`${s.cuidadoraName} ${s.startTime}-${s.endTime}`}
                        >
                          {s.cuidadoraName.split(' ')[0]}
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {activePatients.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No hay pacientes registrados.
          </p>
        )}
      </div>
    </div>
  );
}
