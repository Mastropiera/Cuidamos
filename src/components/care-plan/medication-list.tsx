"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MedicationForm } from "./medication-form";
import type { Medication } from "@/lib/types";
import { ROUTE_LABELS } from "@/lib/types";
import { Plus, Trash2, Clock, Pill } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MedicationListProps {
  patientName: string;
  medications: Medication[];
  selectedDate: string;
  canEdit: boolean;
  canComplete: boolean;
  onCreateMedication: (data: Omit<Medication, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>) => Promise<string | null>;
  onToggleComplete: (medicationId: string) => Promise<boolean>;
  onDeleteMedication: (medicationId: string) => Promise<boolean>;
}

export function MedicationList({
  patientName,
  medications,
  selectedDate,
  canEdit,
  canComplete,
  onCreateMedication,
  onToggleComplete,
  onDeleteMedication,
}: MedicationListProps) {
  const [showForm, setShowForm] = useState(false);
  const [deleteMedId, setDeleteMedId] = useState<string | null>(null);

  // Filter medications for selected date
  const dayMeds = medications.filter((m) => m.date === selectedDate);
  const pendingMeds = dayMeds.filter((m) => !m.completed);
  const completedMeds = dayMeds.filter((m) => m.completed);

  const handleCreate = async (
    data: Omit<Medication, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>
  ) => {
    const result = await onCreateMedication(data);
    if (result) {
      setShowForm(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteMedId) return;
    await onDeleteMedication(deleteMedId);
    setDeleteMedId(null);
  };

  const renderMedication = (med: Medication) => {
    return (
      <div
        key={med.id}
        className={`flex items-start gap-3 p-3 rounded-lg border ${
          med.completed ? "bg-muted/50 opacity-60" : "bg-card"
        }`}
      >
        {canComplete && (
          <Checkbox
            checked={med.completed}
            onCheckedChange={() => onToggleComplete(med.id)}
            className="mt-1"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${med.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {med.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {med.dose}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {ROUTE_LABELS[med.route]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {med.schedule.map((time, i) => (
              <span
                key={i}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                <Clock className="h-3 w-3" />
                {time}
              </span>
            ))}
            {med.recurring && (
              <span className="text-xs text-muted-foreground">
                (Recurrente)
              </span>
            )}
          </div>
          {med.notes && (
            <p className="text-xs text-muted-foreground mt-1">{med.notes}</p>
          )}
          {med.completed && med.completedByName && (
            <p className="text-xs text-muted-foreground mt-1">
              Administrado por: {med.completedByName}
            </p>
          )}
        </div>
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteMedId(med.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">
              Medicamentos - {format(new Date(selectedDate + "T12:00:00"), "d 'de' MMMM", { locale: es })}
            </CardTitle>
          </div>
          {canEdit && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{patientName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {dayMeds.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay medicamentos para este dia.
          </p>
        ) : (
          <>
            {pendingMeds.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Pendientes ({pendingMeds.length})
                </h4>
                <div className="space-y-2">
                  {pendingMeds
                    .sort((a, b) => (a.schedule[0] || "").localeCompare(b.schedule[0] || ""))
                    .map(renderMedication)}
                </div>
              </div>
            )}

            {completedMeds.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Administrados ({completedMeds.length})
                </h4>
                <div className="space-y-2">
                  {completedMeds.map(renderMedication)}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {canEdit && (
        <MedicationForm
          open={showForm}
          onOpenChange={setShowForm}
          onSubmit={handleCreate}
          initialDate={selectedDate}
        />
      )}

      <Dialog open={!!deleteMedId} onOpenChange={(open) => !open && setDeleteMedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Medicamento</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMedId(null)}>
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
