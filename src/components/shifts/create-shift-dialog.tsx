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
import type { Member, Patient } from "@/lib/types";
import type { CreateShiftData } from "@/hooks/useShifts";

interface CreateShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateShiftData) => Promise<string | null>;
  cuidadoras: Member[];
  patients: Patient[];
}

export function CreateShiftDialog({
  open,
  onOpenChange,
  onSubmit,
  cuidadoras,
  patients,
}: CreateShiftDialogProps) {
  const [cuidadoraId, setCuidadoraId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCuidadora = cuidadoras.find((c) => c.id === cuidadoraId);
  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCuidadora || !selectedPatient || !date || !startTime || !endTime) return;

    setIsSubmitting(true);
    const result = await onSubmit({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      cuidadoraId: selectedCuidadora.id,
      cuidadoraName: selectedCuidadora.name,
      cuidadoraColor: selectedCuidadora.color || '#6b7280',
      date,
      startTime,
      endTime,
    });
    setIsSubmitting(false);

    if (result) {
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setCuidadoraId("");
    setPatientId("");
    setDate("");
    setStartTime("");
    setEndTime("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  const activeCuidadoras = cuidadoras.filter((c) => c.active);
  const activePatients = patients.filter((p) => p.active);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo turno</DialogTitle>
            <DialogDescription>
              Asigna una cuidadora a un paciente en una fecha y horario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cuidadora *</Label>
              <Select value={cuidadoraId} onValueChange={setCuidadoraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuidadora" />
                </SelectTrigger>
                <SelectContent>
                  {activeCuidadoras.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        {c.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                        )}
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {activePatients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift-date">Fecha *</Label>
              <Input
                id="shift-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shift-start">Hora inicio *</Label>
                <Input
                  id="shift-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift-end">Hora fin *</Label>
                <Input
                  id="shift-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Preview */}
            {selectedCuidadora && selectedPatient && date && (
              <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                <div className="flex items-center gap-2">
                  {selectedCuidadora.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedCuidadora.color }}
                    />
                  )}
                  <span className="font-medium">{selectedCuidadora.name}</span>
                  <span className="text-muted-foreground">cuidara a</span>
                  <span className="font-medium">{selectedPatient.name}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!cuidadoraId || !patientId || !date || !startTime || !endTime || isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Crear turno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
