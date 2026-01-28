// Tipos para la app Cuidamos - Planificación de cuidados

export interface CareTask {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  category: CareCategory;
  priority: 'low' | 'medium' | 'high';
  recurring?: RecurringPattern;
  patientId?: string;
  assignedTo?: string[];
  notes?: string;
  createdAt: string;
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

export interface Patient {
  id: string;
  name: string;
  identifier?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  createdAt: string;
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
