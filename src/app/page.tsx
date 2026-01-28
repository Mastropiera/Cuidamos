"use client";

import { useState, useMemo } from "react";
import { format, startOfDay } from "date-fns";
import { ViewNavigation, type CalendarViewType } from "@/components/calendar/view-navigation";
import CalendarDisplay from "@/components/calendar/calendar-display";
import { WeeklyView } from "@/components/calendar/weekly-view";
import { DailyView } from "@/components/calendar/daily-view";
import { CarePlanList, TaskList } from "@/components/care-plan";
import { useCarePlan } from "@/hooks/useCarePlan";
import type { CareEvent } from "@/lib/types";
import { Heart, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Temporary user ID (in production, this would come from authentication)
const TEMP_USER_ID = "user-local-1";
const TEMP_USER_EMAIL = "usuario@cuidamos.app";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [currentView, setCurrentView] = useState<CalendarViewType>("monthly");
  const [activeTab, setActiveTab] = useState<"calendar" | "plans">("plans");

  // Use the care plan hook
  const {
    plans,
    tasks,
    selectedPlanId,
    isLoading,
    isFirebaseConfigured,
    setSelectedPlanId,
    createPlan,
    deletePlan,
    createTask,
    toggleTaskComplete,
    deleteTask,
    generateInvite,
    joinWithInvite,
    leaveAsCollaborator,
  } = useCarePlan(TEMP_USER_ID, TEMP_USER_EMAIL);

  // Convert tasks to CareEvents for calendar display
  const calendarEvents: CareEvent[] = useMemo(() => {
    if (!selectedPlanId) return [];
    const planTasks = tasks[selectedPlanId] || [];
    return planTasks.map((task) => ({
      id: task.id,
      title: task.title,
      date: task.date,
      startTime: task.time,
      isAllDay: !task.time,
      type: "task" as const,
      category: task.category,
      completed: task.completed,
    }));
  }, [selectedPlanId, tasks]);

  const handleToggleComplete = async (eventId: string) => {
    if (!selectedPlanId) return;
    await toggleTaskComplete(selectedPlanId, eventId);
  };

  const handleAddEvent = async (eventData: Omit<CareEvent, "id">) => {
    if (!selectedPlanId) return;
    await createTask(selectedPlanId, {
      title: eventData.title,
      date: eventData.date,
      time: eventData.startTime,
      category: eventData.category || "other",
      priority: "medium",
    });
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Show configuration warning if Firebase is not configured
  if (!isFirebaseConfigured) {
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
                <ol className="text-left text-sm space-y-2 text-muted-foreground">
                  <li>1. Copia el archivo <code className="bg-muted px-1 rounded">.env.local.example</code> a <code className="bg-muted px-1 rounded">.env.local</code></li>
                  <li>2. Ve a <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">Firebase Console</a></li>
                  <li>3. Crea un nuevo proyecto</li>
                  <li>4. Habilita Firestore Database</li>
                  <li>5. Copia las credenciales al archivo <code className="bg-muted px-1 rounded">.env.local</code></li>
                  <li>6. Reinicia el servidor de desarrollo</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary fill-primary/20" />
              <h1 className="text-2xl font-bold text-primary">Cuidamos</h1>
            </div>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Planificacion de cuidados
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "calendar" | "plans")}>
          <TabsList className="mb-6">
            <TabsTrigger value="plans">Planes</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Cargando planes...
              </div>
            ) : (
              <>
                <CarePlanList
                  plans={plans}
                  tasks={tasks}
                  userId={TEMP_USER_ID}
                  selectedPlanId={selectedPlanId}
                  onSelectPlan={setSelectedPlanId}
                  onCreatePlan={createPlan}
                  onDeletePlan={deletePlan}
                  onGenerateInvite={generateInvite}
                  onJoinWithInvite={joinWithInvite}
                  onLeavePlan={leaveAsCollaborator}
                />

                {/* Task List for selected plan */}
                {selectedPlan && (
                  <TaskList
                    plan={selectedPlan}
                    tasks={tasks[selectedPlanId!] || []}
                    selectedDate={selectedDateStr}
                    onCreateTask={(data) => createTask(selectedPlanId!, data)}
                    onToggleComplete={(taskId) => toggleTaskComplete(selectedPlanId!, taskId)}
                    onDeleteTask={(taskId) => deleteTask(selectedPlanId!, taskId)}
                  />
                )}
              </>
            )}
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            {!selectedPlanId ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>Selecciona un plan en la pestana &quot;Planes&quot; para ver su calendario.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* View Navigation */}
                <div className="mb-6">
                  <ViewNavigation
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>

                {/* Plan indicator */}
                <p className="text-sm text-muted-foreground mb-4">
                  Mostrando: <span className="font-medium">{selectedPlan?.name}</span>
                </p>

                {/* Calendar Views */}
                <div className="max-w-4xl mx-auto">
                  {currentView === "monthly" && (
                    <CalendarDisplay
                      selectedDate={selectedDate}
                      onDateSelect={(date) => date && setSelectedDate(date)}
                      events={calendarEvents}
                    />
                  )}

                  {currentView === "weekly" && (
                    <WeeklyView
                      selectedDate={selectedDate}
                      onDateSelect={setSelectedDate}
                      events={calendarEvents}
                      onToggleComplete={handleToggleComplete}
                    />
                  )}

                  {currentView === "daily" && (
                    <DailyView
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      events={calendarEvents}
                      onToggleComplete={handleToggleComplete}
                      onAddEvent={handleAddEvent}
                    />
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
