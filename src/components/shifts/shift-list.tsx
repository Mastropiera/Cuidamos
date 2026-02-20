"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShiftCard } from "./shift-card";
import { CreateShiftDialog } from "./create-shift-dialog";
import { Plus, CalendarDays } from "lucide-react";
import type { Shift, Member, Patient } from "@/lib/types";
import type { CreateShiftData } from "@/hooks/useShifts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShiftListProps {
  shifts: Shift[];
  cuidadoras: Member[];
  patients: Patient[];
  canCreate: boolean;
  canDelete: boolean;
  onCreateShift: (data: CreateShiftData) => Promise<string | null>;
  onDeleteShift: (shiftId: string) => Promise<boolean>;
  highlightMemberId?: string;
}

export function ShiftList({
  shifts,
  cuidadoras,
  patients,
  canCreate,
  canDelete,
  onCreateShift,
  onDeleteShift,
  highlightMemberId,
}: ShiftListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteShift, setDeleteShift] = useState<Shift | null>(null);

  const handleDelete = async () => {
    if (!deleteShift) return;
    await onDeleteShift(deleteShift.id);
    setDeleteShift(null);
  };

  // Sort by date, then startTime
  const sortedShifts = [...shifts].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Turnos ({shifts.length})</CardTitle>
          </div>
          {canCreate && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Nuevo turno
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedShifts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay turnos programados.
          </p>
        ) : (
          sortedShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              canDelete={canDelete}
              onDelete={setDeleteShift}
              highlighted={highlightMemberId === shift.cuidadoraId}
            />
          ))
        )}
      </CardContent>

      <CreateShiftDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreateShift}
        cuidadoras={cuidadoras}
        patients={patients}
      />

      <Dialog open={!!deleteShift} onOpenChange={(open) => !open && setDeleteShift(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar turno</DialogTitle>
            <DialogDescription>
              Se eliminara el turno de {deleteShift?.cuidadoraName} con {deleteShift?.patientName}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteShift(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
