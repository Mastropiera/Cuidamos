"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AdministrationRoute, Medication, RecurringPattern } from "@/lib/types";
import { ROUTE_LABELS } from "@/lib/types";
import { Plus, X } from "lucide-react";

interface MedicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Medication, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>) => Promise<void>;
  initialDate?: string;
}

const ROUTES: AdministrationRoute[] = [
  "oral",
  "sublingual",
  "intramuscular",
  "intravenosa",
  "topica",
  "inhalatoria",
  "rectal",
  "oftalmica",
  "otica",
];

export function MedicationForm({
  open,
  onOpenChange,
  onSubmit,
  initialDate,
}: MedicationFormProps) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState<AdministrationRoute>("oral");
  const [schedules, setSchedules] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(initialDate || "");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<RecurringPattern["type"]>("daily");
  const [recurringInterval, setRecurringInterval] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSchedules = schedules.filter((s) => s.trim() !== "");
    if (!name.trim() || !dose.trim() || !date || validSchedules.length === 0) return;

    setIsSubmitting(true);

    const medData: Omit<Medication, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'> = {
      name: name.trim(),
      dose: dose.trim(),
      route,
      schedule: validSchedules,
      notes: notes.trim() || undefined,
      date,
      recurring: isRecurring
        ? {
            type: recurringType,
            interval: parseInt(recurringInterval) || 1,
          }
        : undefined,
    };

    await onSubmit(medData);
    setIsSubmitting(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDose("");
    setRoute("oral");
    setSchedules([""]);
    setNotes("");
    setDate(initialDate || "");
    setIsRecurring(false);
    setRecurringType("daily");
    setRecurringInterval("1");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const addSchedule = () => {
    setSchedules([...schedules, ""]);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length <= 1) return;
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, value: string) => {
    const updated = [...schedules];
    updated[index] = value;
    setSchedules(updated);
  };

  const validSchedules = schedules.filter((s) => s.trim() !== "");
  const canSubmit = name.trim() && dose.trim() && date && validSchedules.length > 0 && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Medicamento</DialogTitle>
            <DialogDescription>
              Agrega un medicamento al plan de cuidados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="med-name">Medicamento *</Label>
              <Input
                id="med-name"
                placeholder="Ej: Losartan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Dose */}
            <div className="space-y-2">
              <Label htmlFor="med-dose">Dosis *</Label>
              <Input
                id="med-dose"
                placeholder="Ej: 50mg"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                required
              />
            </div>

            {/* Route */}
            <div className="space-y-2">
              <Label>Via de administracion *</Label>
              <Select value={route} onValueChange={(v) => setRoute(v as AdministrationRoute)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROUTES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROUTE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedules */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Horario(s) *</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addSchedule}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar horario
                </Button>
              </div>
              <div className="space-y-2">
                {schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={schedule}
                      onChange={(e) => updateSchedule(index, e.target.value)}
                      required={index === 0}
                    />
                    {schedules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeSchedule(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="med-notes">Notas</Label>
              <Input
                id="med-notes"
                placeholder="Notas adicionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="med-date">Fecha de inicio *</Label>
              <Input
                id="med-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Recurring */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="med-recurring-switch">Medicamento recurrente</Label>
                <Switch
                  id="med-recurring-switch"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label>Frecuencia</Label>
                    <Select
                      value={recurringType}
                      onValueChange={(v) => setRecurringType(v as RecurringPattern["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="med-recurring-interval">
                      Cada cuantos {recurringType === "daily" ? "dias" : recurringType === "weekly" ? "semanas" : "meses"}
                    </Label>
                    <Input
                      id="med-recurring-interval"
                      type="number"
                      min="1"
                      max="30"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Guardando..." : "Crear Medicamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
