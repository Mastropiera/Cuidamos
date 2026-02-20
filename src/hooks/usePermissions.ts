"use client";

import { useMemo } from "react";
import { canRole, canCompleteForPatient, getEffectiveRole } from "@/lib/permissions";
import type { UserRole, Shift } from "@/lib/types";

export function usePermissions(
  role: UserRole | null,
  memberId: string | null,
  shifts: Shift[],
  canCoordinate: boolean = false
) {
  return useMemo(() => {
    const effectiveRole = getEffectiveRole(role, canCoordinate);

    return {
      effectiveRole,
      canManageTeam: canRole(effectiveRole, 'manage_team'),
      canCreatePatient: canRole(effectiveRole, 'create_patient'),
      canDeletePatient: canRole(effectiveRole, 'delete_patient'),
      canEditPatient: canRole(effectiveRole, 'edit_patient'),
      canCreateTask: canRole(effectiveRole, 'create_task'),
      canDeleteTask: canRole(effectiveRole, 'delete_task'),
      canCreateMedication: canRole(effectiveRole, 'create_medication'),
      canDeleteMedication: canRole(effectiveRole, 'delete_medication'),
      canCreateShift: canRole(effectiveRole, 'create_shift'),
      canDeleteShift: canRole(effectiveRole, 'delete_shift'),

      canCompleteForPatient: (patientId: string, date?: string) =>
        canCompleteForPatient(effectiveRole, memberId, patientId, shifts, date),
    };
  }, [role, memberId, shifts, canCoordinate]);
}
