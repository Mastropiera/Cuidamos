import type { UserRole, Shift } from './types';

type Action =
  | 'manage_team'
  | 'create_patient'
  | 'delete_patient'
  | 'edit_patient'
  | 'view_patients'
  | 'create_task'
  | 'delete_task'
  | 'complete_task'
  | 'create_medication'
  | 'delete_medication'
  | 'complete_medication'
  | 'create_shift'
  | 'delete_shift'
  | 'view_shifts'
  | 'view_calendar';

const ROLE_PERMISSIONS: Record<UserRole, Action[]> = {
  coordinadora: [
    'manage_team',
    'create_patient', 'delete_patient', 'edit_patient', 'view_patients',
    'create_task', 'delete_task', 'complete_task',
    'create_medication', 'delete_medication', 'complete_medication',
    'create_shift', 'delete_shift', 'view_shifts',
    'view_calendar',
  ],
  enfermera: [
    'view_patients',
    'create_task', 'delete_task', 'complete_task',
    'create_medication', 'delete_medication', 'complete_medication',
    'view_shifts',
    'view_calendar',
  ],
  cuidadora: [
    'view_patients',
    'complete_task',
    'complete_medication',
    'view_shifts',
    'view_calendar',
  ],
};

export function canRole(role: UserRole | null, action: Action): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(action);
}

export function isCuidadoraOnShift(
  memberId: string,
  patientId: string,
  shifts: Shift[],
  date?: string
): boolean {
  const today = date || new Date().toISOString().split('T')[0];
  return shifts.some(
    (s) =>
      s.cuidadoraId === memberId &&
      s.patientId === patientId &&
      s.date === today
  );
}

export function canCompleteForPatient(
  role: UserRole | null,
  memberId: string | null,
  patientId: string,
  shifts: Shift[],
  date?: string
): boolean {
  if (!role || !memberId) return false;
  if (role === 'coordinadora' || role === 'enfermera') return true;
  if (role === 'cuidadora') {
    return isCuidadoraOnShift(memberId, patientId, shifts, date);
  }
  return false;
}
