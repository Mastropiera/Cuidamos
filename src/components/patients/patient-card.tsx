"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User } from "lucide-react";
import type { Patient } from "@/lib/types";

interface PatientCardProps {
  patient: Patient;
  isSelected: boolean;
  onSelect: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  canEdit: boolean;
}

export function PatientCard({
  patient,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  canEdit,
}: PatientCardProps) {
  return (
    <div
      onClick={() => onSelect(patient)}
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "bg-card hover:bg-muted/50"
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <User className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm">{patient.name}</span>
        {patient.identifier && (
          <p className="text-xs text-muted-foreground">{patient.identifier}</p>
        )}
      </div>

      {canEdit && (
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(patient)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(patient)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
