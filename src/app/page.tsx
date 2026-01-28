"use client";

import { useState } from "react";
import { format, startOfDay } from "date-fns";
import { ViewNavigation, type CalendarViewType } from "@/components/calendar/view-navigation";
import CalendarDisplay from "@/components/calendar/calendar-display";
import { WeeklyView } from "@/components/calendar/weekly-view";
import { DailyView } from "@/components/calendar/daily-view";
import type { CareEvent } from "@/lib/types";
import { Heart } from "lucide-react";

// Datos de ejemplo para demostrar el calendario
const DEMO_EVENTS: CareEvent[] = [
  {
    id: "1",
    title: "Dar medicamento para la presión",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "08:00",
    isAllDay: false,
    type: "task",
    category: "medication",
    completed: false,
  },
  {
    id: "2",
    title: "Control de signos vitales",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    isAllDay: false,
    type: "task",
    category: "monitoring",
    completed: true,
  },
  {
    id: "3",
    title: "Ejercicios de movilidad",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "15:00",
    isAllDay: false,
    type: "task",
    category: "mobility",
    completed: false,
  },
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [currentView, setCurrentView] = useState<CalendarViewType>("monthly");
  const [events, setEvents] = useState<CareEvent[]>(DEMO_EVENTS);

  const handleToggleComplete = (eventId: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, completed: !event.completed }
          : event
      )
    );
  };

  const handleAddEvent = (eventData: Omit<CareEvent, "id">) => {
    const newEvent: CareEvent = {
      ...eventData,
      id: crypto.randomUUID(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

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
              Planificación de cuidados
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* View Navigation */}
        <div className="mb-6">
          <ViewNavigation
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>

        {/* Calendar Views */}
        <div className="max-w-4xl mx-auto">
          {currentView === "monthly" && (
            <CalendarDisplay
              selectedDate={selectedDate}
              onDateSelect={(date) => date && setSelectedDate(date)}
              events={events}
            />
          )}

          {currentView === "weekly" && (
            <WeeklyView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              events={events}
              onToggleComplete={handleToggleComplete}
            />
          )}

          {currentView === "daily" && (
            <DailyView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              events={events}
              onToggleComplete={handleToggleComplete}
              onAddEvent={handleAddEvent}
            />
          )}
        </div>

        {/* Info section */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Usa las vistas para navegar entre día, semana y mes.
            <br />
            En la vista diaria puedes añadir tareas de cuidado.
          </p>
        </div>
      </main>
    </div>
  );
}
