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
import type { CreatePatientData } from "@/hooks/usePatients";

interface CreatePatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePatientData) => Promise<string | null>;
}

export function CreatePatientDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreatePatientDialogProps) {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await onSubmit({
      name,
      identifier: identifier || undefined,
      birthDate: birthDate || undefined,
      address: address || undefined,
      phone: phone || undefined,
      emergencyContact: emergencyContact || undefined,
      medicalNotes: medicalNotes || undefined,
    });
    setIsSubmitting(false);

    if (result) {
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setName("");
    setIdentifier("");
    setBirthDate("");
    setAddress("");
    setPhone("");
    setEmergencyContact("");
    setMedicalNotes("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo paciente</DialogTitle>
            <DialogDescription>
              Registra un nuevo paciente en la organizacion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient-name">Nombre completo *</Label>
              <Input
                id="patient-name"
                placeholder="Ej: Juan Perez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-id">Identificacion</Label>
              <Input
                id="patient-id"
                placeholder="DNI, cedula, etc."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-birth">Fecha de nacimiento</Label>
                <Input
                  id="patient-birth"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Telefono</Label>
                <Input
                  id="patient-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-address">Direccion</Label>
              <Input
                id="patient-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-emergency">Contacto de emergencia</Label>
              <Input
                id="patient-emergency"
                placeholder="Nombre y telefono"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient-notes">Notas medicas</Label>
              <Input
                id="patient-notes"
                placeholder="Condiciones, alergias, observaciones..."
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Guardando..." : "Crear paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
