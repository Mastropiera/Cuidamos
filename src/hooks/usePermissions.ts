"use client";

import { useMemo } from "react";
import { canRole, canCompleteForPatient } from "@/lib/permissions";
import type { UserRole, Shift } from "@/lib/types";

export function usePermissions(
  role: UserRole | null,
  memberId: string | null,
  shifts: Shift[]
) {
  return useMemo(() => {
    return {
      canManageTeam: canRole(role, 'manage_team'),
      canCreatePatient: canRole(role, 'create_patient'),
      canDeletePatient: canRole(role, 'delete_patient'),
      canEditPatient: canRole(role, 'edit_patient'),
      canCreateTask: canRole(role, 'create_task'),
      canDeleteTask: canRole(role, 'delete_task'),
      canCreateMedication: canRole(role, 'create_medication'),
      canDeleteMedication: canRole(role, 'delete_medication'),
      canCreateShift: canRole(role, 'create_shift'),
      canDeleteShift: canRole(role, 'delete_shift'),

      canCompleteForPatient: (patientId: string, date?: string) =>
        canCompleteForPatient(role, memberId, patientId, shifts, date),
    };
  }, [role, memberId, shifts]);
}
