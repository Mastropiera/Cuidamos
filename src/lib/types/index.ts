// Tipos para la app Cuidamos - Sistema de roles y organizaciones

// ==========================================
// ROLES
// ==========================================
export type UserRole = 'coordinadora' | 'enfermera' | 'cuidadora';

// ==========================================
// ORGANIZATION
// ==========================================
export interface Organization {
  id: string;
  name: string;
  createdBy: string; // UID
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MEMBER - Miembro de una organización
// ==========================================
export interface Member {
  id: string;
  uid: string | null; // null hasta primer login
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  color: string | null; // hex, solo cuidadoras
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// EMAIL MAPPING - Lookup rápido al login
// ==========================================
export interface EmailMapping {
  orgId: string;
  memberId: string;
  role: UserRole;
  createdAt: string;
}

// ==========================================
// PATIENT - Paciente de la organización
// ==========================================
export interface Patient {
  id: string;
  name: string;
  identifier?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// SHIFT - Turno de cuidadora con paciente
// ==========================================
export interface Shift {
  id: string;
  patientId: string;
  patientName: string; // denormalized
  cuidadoraId: string; // memberId
  cuidadoraName: string; // denormalized
  cuidadoraColor: string; // denormalized hex
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

// ==========================================
// APP USER - Usuario con contexto de org/rol
// ==========================================
export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  orgId: string | null;
  memberId: string | null;
  role: UserRole | null;
  memberColor: string | null;
}

// ==========================================
// CARE TASK - Tareas de cuidado
// ==========================================
export interface CareTask {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  completedBy?: string; // memberId
  completedByName?: string;
  category: CareCategory;
  priority: 'low' | 'medium' | 'high';
  recurring?: RecurringPattern;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export type CareCategory =
  | 'medication'      // Medicamentos
  | 'hygiene'         // Higiene personal
  | 'nutrition'       // Alimentación
  | 'mobility'        // Movilidad/Ejercicio
  | 'medical'         // Citas médicas
  | 'therapy'         // Terapias
  | 'monitoring'      // Monitoreo de signos vitales
  | 'emotional'       // Apoyo emocional
  | 'other';          // Otros

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number; // cada cuántos días/semanas/meses
  daysOfWeek?: number[]; // 0-6, para semanal
  endDate?: string;
}

// ==========================================
// MEDICATION - Medicamentos dedicados
// ==========================================
export type AdministrationRoute =
  | 'oral'
  | 'sublingual'
  | 'intramuscular'
  | 'intravenosa'
  | 'topica'
  | 'inhalatoria'
  | 'rectal'
  | 'oftalmica'
  | 'otica';

export const ROUTE_LABELS: Record<AdministrationRoute, string> = {
  oral: 'Oral',
  sublingual: 'Sublingual',
  intramuscular: 'Intramuscular',
  intravenosa: 'Intravenosa',
  topica: 'Tópica',
  inhalatoria: 'Inhalatoria',
  rectal: 'Rectal',
  oftalmica: 'Oftálmica',
  otica: 'Ótica',
};

export interface Medication {
  id: string;
  patientId: string;
  name: string;                     // Nombre del medicamento
  dose: string;                     // Ej: "500mg", "1 pastilla"
  route: AdministrationRoute;       // Vía de administración
  schedule: string[];               // Horarios HH:mm
  notes?: string;                   // Notas opcionales
  date: string;                     // YYYY-MM-DD fecha inicio
  recurring?: RecurringPattern;     // Patrón de recurrencia
  completed: boolean;
  completedAt?: string;
  completedBy?: string; // memberId
  completedByName?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface CareEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isAllDay: boolean;
  type: 'task' | 'appointment' | 'reminder';
  category?: CareCategory;
  completed?: boolean;
  color?: string;
}

// Colores por categoría
export const CATEGORY_COLORS: Record<CareCategory, { bg: string; text: string; label: string }> = {
  medication: { bg: '#dbeafe', text: '#1e40af', label: 'Medicamentos' },
  hygiene: { bg: '#f0fdf4', text: '#166534', label: 'Higiene' },
  nutrition: { bg: '#fef3c7', text: '#92400e', label: 'Alimentación' },
  mobility: { bg: '#fce7f3', text: '#9d174d', label: 'Movilidad' },
  medical: { bg: '#fee2e2', text: '#991b1b', label: 'Citas médicas' },
  therapy: { bg: '#e0e7ff', text: '#3730a3', label: 'Terapias' },
  monitoring: { bg: '#ccfbf1', text: '#115e59', label: 'Monitoreo' },
  emotional: { bg: '#fae8ff', text: '#86198f', label: 'Apoyo emocional' },
  other: { bg: '#f3f4f6', text: '#374151', label: 'Otros' },
};

// Colores predefinidos para cuidadoras
export const CUIDADORA_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#14b8a6', // teal
];

export const ROLE_LABELS: Record<UserRole, string> = {
  coordinadora: 'Coordinadora',
  enfermera: 'Enfermera',
  cuidadora: 'Cuidadora',
};
