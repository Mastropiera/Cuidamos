"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Clock, User } from "lucide-react";
import type { Shift } from "@/lib/types";

interface ShiftCardProps {
  shift: Shift;
  canDelete: boolean;
  onDelete?: (shift: Shift) => void;
  highlighted?: boolean;
}

export function ShiftCard({ shift, canDelete, onDelete, highlighted }: ShiftCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        highlighted ? "ring-2 ring-primary/30 bg-primary/5" : "bg-card"
      }`}
    >
      <div
        className="w-3 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: shift.cuidadoraColor }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{shift.patientName}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {shift.cuidadoraName}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {shift.startTime} - {shift.endTime}
          </span>
        </div>
      </div>

      {canDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(shift)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
