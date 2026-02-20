"use client";

import { useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftCard } from "./shift-card";
import { CalendarDays } from "lucide-react";
import type { Shift } from "@/lib/types";

interface MyShiftsViewProps {
  shifts: Shift[];
  memberId: string;
  onSelectShift?: (shift: Shift) => void;
}

export function MyShiftsView({ shifts, memberId, onSelectShift }: MyShiftsViewProps) {
  const today = format(startOfDay(new Date()), "yyyy-MM-dd");

  const myShifts = useMemo(
    () => shifts.filter((s) => s.cuidadoraId === memberId),
    [shifts, memberId]
  );

  const todayShifts = myShifts.filter((s) => s.date === today);
  const upcomingShifts = myShifts
    .filter((s) => s.date > today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
  const pastShifts = myShifts
    .filter((s) => s.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const renderSection = (title: string, items: Shift[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        {items.map((shift) => (
          <div key={shift.id} onClick={() => onSelectShift?.(shift)} className="cursor-pointer">
            <ShiftCard shift={shift} canDelete={false} highlighted={shift.date === today} />
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              {format(new Date(shift.date + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Mis Turnos</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {myShifts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No tienes turnos asignados.
          </p>
        ) : (
          <>
            {renderSection(`Hoy (${todayShifts.length})`, todayShifts)}
            {renderSection(`Proximos (${upcomingShifts.length})`, upcomingShifts)}
            {renderSection(`Pasados (${pastShifts.length})`, pastShifts.slice(0, 10))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
