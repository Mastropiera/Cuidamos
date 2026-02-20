"use client";

import { useState } from "react";
import { format } from "date-fns";
import { startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/care-plan/task-list";
import { MedicationList } from "@/components/care-plan/medication-list";
import { ArrowLeft, User, Phone, MapPin, AlertCircle, FileText } from "lucide-react";
import type { Patient, CareTask, Medication } from "@/lib/types";

interface PatientDetailViewProps {
  patient: Patient;
  tasks: CareTask[];
  medications: Medication[];
  canEditTasks: boolean;
  canEditMedications: boolean;
  canComplete: boolean;
  onBack: () => void;
  onCreateTask: (data: Omit<CareTask, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>) => Promise<string | null>;
  onToggleTaskComplete: (taskId: string) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
  onCreateMedication: (data: Omit<Medication, 'id' | 'patientId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>) => Promise<string | null>;
  onToggleMedicationComplete: (medId: string) => Promise<boolean>;
  onDeleteMedication: (medId: string) => Promise<boolean>;
}

export function PatientDetailView({
  patient,
  tasks,
  medications,
  canEditTasks,
  canEditMedications,
  canComplete,
  onBack,
  onCreateTask,
  onToggleTaskComplete,
  onDeleteTask,
  onCreateMedication,
  onToggleMedicationComplete,
  onDeleteMedication,
}: PatientDetailViewProps) {
  const [selectedDate] = useState(format(startOfDay(new Date()), "yyyy-MM-dd"));

  return (
    <div className="space-y-4">
      {/* Patient info header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{patient.name}</CardTitle>
              {patient.identifier && (
                <p className="text-sm text-muted-foreground">{patient.identifier}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {patient.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {patient.phone}
              </div>
            )}
            {patient.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {patient.address}
              </div>
            )}
            {patient.emergencyContact && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                {patient.emergencyContact}
              </div>
            )}
            {patient.medicalNotes && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-full">
                <FileText className="h-4 w-4 flex-shrink-0" />
                {patient.medicalNotes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <MedicationList
        patientName={patient.name}
        medications={medications}
        selectedDate={selectedDate}
        canEdit={canEditMedications}
        canComplete={canComplete}
        onCreateMedication={onCreateMedication}
        onToggleComplete={onToggleMedicationComplete}
        onDeleteMedication={onDeleteMedication}
      />

      {/* Tasks */}
      <TaskList
        patientName={patient.name}
        tasks={tasks}
        selectedDate={selectedDate}
        canEdit={canEditTasks}
        canComplete={canComplete}
        onCreateTask={onCreateTask}
        onToggleComplete={onToggleTaskComplete}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}
