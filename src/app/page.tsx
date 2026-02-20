"use client";

import { useState, useCallback } from "react";
import { startOfDay } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { isConfigured } from "@/lib/firebase";
import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingView } from "@/components/onboarding/onboarding-view";
import { AppShell } from "@/components/layout/app-shell";
import { MemberList } from "@/components/team/member-list";
import { PatientList } from "@/components/patients/patient-list";
import { PatientDetailView } from "@/components/patients/patient-detail-view";
import { ShiftList } from "@/components/shifts/shift-list";
import { MyShiftsView } from "@/components/shifts/my-shifts-view";
import { ViewNavigation, type CalendarViewType } from "@/components/calendar/view-navigation";
import CalendarDisplay from "@/components/calendar/calendar-display";
import { WeeklyView } from "@/components/calendar/weekly-view";
import { DailyView } from "@/components/calendar/daily-view";
import { useMembers } from "@/hooks/useMembers";
import { usePatients } from "@/hooks/usePatients";
import { usePatientTasks } from "@/hooks/usePatientTasks";
import { usePatientMedications } from "@/hooks/usePatientMedications";
import { useShifts } from "@/hooks/useShifts";
import { usePermissions } from "@/hooks/usePermissions";
import { Heart, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Patient, Shift } from "@/lib/types";

export default function Home() {
  const { user, appUser, loading, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [currentView, setCurrentView] = useState<CalendarViewType>("weekly");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [calendarFilterPatientId, setCalendarFilterPatientId] = useState<string | null>(null);

  const orgId = appUser?.orgId || null;
  const role = appUser?.role || null;
  const memberId = appUser?.memberId || null;

  // Data hooks
  const { members, createMember, updateMember, deleteMember } = useMembers(orgId);
  const { patients, createPatient, deletePatient } = usePatients(orgId);
  const { tasks, createTask, toggleTaskComplete, deleteTask } = usePatientTasks(orgId, viewingPatient?.id || null);
  const { medications, createMedication, toggleMedicationComplete, deleteMedication } = usePatientMedications(orgId, viewingPatient?.id || null);
  const { shifts, createShift, deleteShift } = useShifts(orgId);

  // Permissions
  const perms = usePermissions(role, memberId, shifts);

  // Cuidadoras for shift creation
  const cuidadoras = members.filter((m) => m.role === 'cuidadora' && m.active);

  // Member name lookup for completions
  const currentMemberName = members.find((m) => m.id === memberId)?.name || appUser?.displayName || '';

  // Handlers
  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatientId(patient.id);
    setViewingPatient(patient);
  }, []);

  const handleBackFromPatient = useCallback(() => {
    setViewingPatient(null);
  }, []);

  const handleToggleTaskComplete = useCallback(async (taskId: string) => {
    if (!memberId) return false;
    return toggleTaskComplete(taskId, memberId, currentMemberName);
  }, [toggleTaskComplete, memberId, currentMemberName]);

  const handleToggleMedicationComplete = useCallback(async (medId: string) => {
    if (!memberId) return false;
    return toggleMedicationComplete(medId, memberId, currentMemberName);
  }, [toggleMedicationComplete, memberId, currentMemberName]);

  const handleCreateShift = useCallback(async (data: Parameters<typeof createShift>[0]) => {
    if (!memberId) return null;
    return createShift(data, memberId);
  }, [createShift, memberId]);

  const handleShiftSelect = useCallback((shift: Shift) => {
    const patient = patients.find((p) => p.id === shift.patientId);
    if (patient) {
      setSelectedPatientId(patient.id);
      setViewingPatient(patient);
    }
  }, [patients]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Heart className="h-8 w-8 text-primary fill-primary/20 animate-pulse" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !appUser) {
    return <AuthCard />;
  }

  // Firebase not configured
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary fill-primary/20" />
              <h1 className="text-2xl font-bold text-primary">Cuidamos</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-amber-500" />
                <h2 className="text-xl font-semibold">Configuracion de Firebase Requerida</h2>
                <p className="text-muted-foreground">
                  Para usar Cuidamos, necesitas configurar Firebase.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // No organization - show onboarding
  if (!appUser.orgId || !appUser.role) {
    return <OnboardingView />;
  }

  // Get org name
  const orgName = members.length > 0 ? undefined : undefined; // org name loaded elsewhere

  // Determine which tabs to show based on role
  const renderTabs = () => {
    if (role === 'coordinadora') return renderCoordinadoraTabs();
    if (role === 'enfermera') return renderEnfermeraTabs();
    if (role === 'cuidadora') return renderCuidadoraTabs();
    return null;
  };

  // ===== COORDINADORA TABS =====
  const renderCoordinadoraTabs = () => (
    <Tabs defaultValue="equipo">
      <TabsList className="mb-6 flex-wrap">
        <TabsTrigger value="equipo">Equipo</TabsTrigger>
        <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
        <TabsTrigger value="turnos">Turnos</TabsTrigger>
        <TabsTrigger value="calendario">Calendario</TabsTrigger>
      </TabsList>

      <TabsContent value="equipo">
        <MemberList
          members={members}
          canManage={perms.canManageTeam}
          onCreateMember={createMember}
          onUpdateMember={updateMember}
          onDeleteMember={deleteMember}
        />
      </TabsContent>

      <TabsContent value="pacientes">
        {viewingPatient ? (
          <PatientDetailView
            patient={viewingPatient}
            tasks={tasks}
            medications={medications}
            canEditTasks={perms.canCreateTask}
            canEditMedications={perms.canCreateMedication}
            canComplete={perms.canCompleteForPatient(viewingPatient.id)}
            onBack={handleBackFromPatient}
            onCreateTask={createTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={deleteTask}
            onCreateMedication={createMedication}
            onToggleMedicationComplete={handleToggleMedicationComplete}
            onDeleteMedication={deleteMedication}
          />
        ) : (
          <PatientList
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            canCreate={perms.canCreatePatient}
            canDelete={perms.canDeletePatient}
            onCreatePatient={createPatient}
            onDeletePatient={deletePatient}
          />
        )}
      </TabsContent>

      <TabsContent value="turnos">
        <ShiftList
          shifts={shifts}
          cuidadoras={cuidadoras}
          patients={patients}
          canCreate={perms.canCreateShift}
          canDelete={perms.canDeleteShift}
          onCreateShift={handleCreateShift}
          onDeleteShift={deleteShift}
        />
      </TabsContent>

      <TabsContent value="calendario">
        {renderCalendar()}
      </TabsContent>
    </Tabs>
  );

  // ===== ENFERMERA TABS =====
  const renderEnfermeraTabs = () => (
    <Tabs defaultValue="pacientes">
      <TabsList className="mb-6">
        <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
        <TabsTrigger value="calendario">Calendario</TabsTrigger>
      </TabsList>

      <TabsContent value="pacientes">
        {viewingPatient ? (
          <PatientDetailView
            patient={viewingPatient}
            tasks={tasks}
            medications={medications}
            canEditTasks={perms.canCreateTask}
            canEditMedications={perms.canCreateMedication}
            canComplete={perms.canCompleteForPatient(viewingPatient.id)}
            onBack={handleBackFromPatient}
            onCreateTask={createTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={deleteTask}
            onCreateMedication={createMedication}
            onToggleMedicationComplete={handleToggleMedicationComplete}
            onDeleteMedication={deleteMedication}
          />
        ) : (
          <PatientList
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            canCreate={false}
            canDelete={false}
          />
        )}
      </TabsContent>

      <TabsContent value="calendario">
        {renderCalendar()}
      </TabsContent>
    </Tabs>
  );

  // ===== CUIDADORA TABS =====
  const renderCuidadoraTabs = () => (
    <Tabs defaultValue="mis-turnos">
      <TabsList className="mb-6">
        <TabsTrigger value="mis-turnos">Mis Turnos</TabsTrigger>
        <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
        <TabsTrigger value="calendario">Calendario</TabsTrigger>
      </TabsList>

      <TabsContent value="mis-turnos">
        {viewingPatient ? (
          <PatientDetailView
            patient={viewingPatient}
            tasks={tasks}
            medications={medications}
            canEditTasks={false}
            canEditMedications={false}
            canComplete={perms.canCompleteForPatient(viewingPatient.id)}
            onBack={handleBackFromPatient}
            onCreateTask={createTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={deleteTask}
            onCreateMedication={createMedication}
            onToggleMedicationComplete={handleToggleMedicationComplete}
            onDeleteMedication={deleteMedication}
          />
        ) : (
          <MyShiftsView
            shifts={shifts}
            memberId={memberId!}
            onSelectShift={handleShiftSelect}
          />
        )}
      </TabsContent>

      <TabsContent value="pacientes">
        {viewingPatient ? (
          <PatientDetailView
            patient={viewingPatient}
            tasks={tasks}
            medications={medications}
            canEditTasks={false}
            canEditMedications={false}
            canComplete={perms.canCompleteForPatient(viewingPatient.id)}
            onBack={handleBackFromPatient}
            onCreateTask={createTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onDeleteTask={deleteTask}
            onCreateMedication={createMedication}
            onToggleMedicationComplete={handleToggleMedicationComplete}
            onDeleteMedication={deleteMedication}
          />
        ) : (
          <PatientList
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            canCreate={false}
            canDelete={false}
          />
        )}
      </TabsContent>

      <TabsContent value="calendario">
        {renderCalendar()}
      </TabsContent>
    </Tabs>
  );

  // ===== CALENDAR (shared across roles) =====
  const renderCalendar = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <ViewNavigation currentView={currentView} onViewChange={setCurrentView} />

        {/* Patient filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <Select
            value={calendarFilterPatientId || "__all__"}
            onValueChange={(v) => setCalendarFilterPatientId(v === "__all__" ? null : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos los pacientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los pacientes</SelectItem>
              {patients.filter((p) => p.active).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {currentView === "monthly" && (
          <CalendarDisplay
            selectedDate={selectedDate}
            onDateSelect={(date) => date && setSelectedDate(date)}
            shifts={shifts}
            selectedPatientId={calendarFilterPatientId}
          />
        )}

        {currentView === "weekly" && (
          <WeeklyView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            shifts={calendarFilterPatientId
              ? shifts.filter((s) => s.patientId === calendarFilterPatientId)
              : shifts
            }
            patients={patients}
            highlightMemberId={role === 'cuidadora' ? memberId || undefined : undefined}
          />
        )}

        {currentView === "daily" && (
          <DailyView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            shifts={calendarFilterPatientId
              ? shifts.filter((s) => s.patientId === calendarFilterPatientId)
              : shifts
            }
            highlightMemberId={role === 'cuidadora' ? memberId || undefined : undefined}
          />
        )}
      </div>
    </div>
  );

  return (
    <AppShell appUser={appUser} orgName={orgName} onLogout={logout}>
      {renderTabs()}
    </AppShell>
  );
}
