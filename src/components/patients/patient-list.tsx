"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PatientCard } from "./patient-card";
import { CreatePatientDialog } from "./create-patient-dialog";
import { Plus, Users } from "lucide-react";
import type { Patient } from "@/lib/types";
import type { CreatePatientData } from "@/hooks/usePatients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PatientListProps {
  patients: Patient[];
  selectedPatientId: string | null;
  onSelectPatient: (patient: Patient) => void;
  canCreate: boolean;
  canDelete: boolean;
  onCreatePatient?: (data: CreatePatientData) => Promise<string | null>;
  onDeletePatient?: (patientId: string) => Promise<boolean>;
}

export function PatientList({
  patients,
  selectedPatientId,
  onSelectPatient,
  canCreate,
  canDelete,
  onCreatePatient,
  onDeletePatient,
}: PatientListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);

  const handleDelete = async () => {
    if (!deletePatient || !onDeletePatient) return;
    await onDeletePatient(deletePatient.id);
    setDeletePatient(null);
  };

  const activePatients = patients.filter((p) => p.active);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Pacientes ({activePatients.length})</CardTitle>
          </div>
          {canCreate && onCreatePatient && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activePatients.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay pacientes registrados.
          </p>
        ) : (
          activePatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isSelected={patient.id === selectedPatientId}
              onSelect={onSelectPatient}
              canEdit={canDelete}
              onDelete={canDelete ? setDeletePatient : undefined}
            />
          ))
        )}
      </CardContent>

      {onCreatePatient && (
        <CreatePatientDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSubmit={onCreatePatient}
        />
      )}

      <Dialog open={!!deletePatient} onOpenChange={(open) => !open && setDeletePatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar paciente</DialogTitle>
            <DialogDescription>
              Se eliminara a {deletePatient?.name}. Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePatient(null)}>
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
