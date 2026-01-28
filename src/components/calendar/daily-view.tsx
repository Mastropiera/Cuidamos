"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  PlusCircle,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { format, addDays, subDays, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import type { CareEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DailyViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  events: CareEvent[];
  onToggleComplete?: (eventId: string) => void;
  onAddEvent?: (event: Omit<CareEvent, 'id'>) => void;
}

export function DailyView({
  selectedDate,
  onDateChange,
  events,
  onToggleComplete,
  onAddEvent,
}: DailyViewProps) {
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const isToday = isSameDay(selectedDate, new Date());

  // Form state for adding tasks
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const handleAddTask = () => {
    if (newTaskTitle.trim() && onAddEvent) {
      const eventData: Omit<CareEvent, 'id'> = {
        title: newTaskTitle.trim(),
        date: dateKey,
        isAllDay: !newTaskTime.trim(),
        startTime: newTaskTime.trim() || undefined,
        type: 'task',
        completed: false,
      };

      onAddEvent(eventData);
      setNewTaskTitle('');
      setNewTaskTime('');
      setIsFormExpanded(false);
    }
  };

  // Get events for selected day
  const dayEvents = useMemo(() => {
    return events
      .filter(event => event.date === dateKey)
      .sort((a, b) => {
        // All-day events first
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        // Then by start time
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });
  }, [events, dateKey]);

  const completedCount = dayEvents.filter(e => e.completed).length;
  const pendingCount = dayEvents.filter(e => !e.completed).length;

  const goToPrevDay = () => onDateChange(subDays(selectedDate, 1));
  const goToNextDay = () => onDateChange(addDays(selectedDate, 1));
  const goToToday = () => onDateChange(startOfDay(new Date()));

  return (
    <div className="bg-card p-4 sm:p-6 rounded-xl shadow-xl border-2 border-border">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="icon" onClick={goToPrevDay}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-lg sm:text-xl font-bold text-primary capitalize">
            {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </h2>
          {!isToday && (
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
              Ir a hoy
            </Button>
          )}
        </div>

        <Button variant="outline" size="icon" onClick={goToNextDay}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      {(completedCount > 0 || pendingCount > 0) && (
        <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
          {pendingCount > 0 && (
            <span className="flex items-center gap-2 text-orange-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{pendingCount} pendientes</span>
            </span>
          )}
          {completedCount > 0 && (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">{completedCount} completadas</span>
            </span>
          )}
        </div>
      )}

      {/* Events list */}
      <div className="space-y-2">
        {dayEvents.length === 0 && !isFormExpanded && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay tareas para este día</p>
          </div>
        )}

        {dayEvents.map((event) => (
          <div
            key={event.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors",
              event.completed
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            )}
          >
            {onToggleComplete && (
              <Checkbox
                checked={event.completed}
                onCheckedChange={() => onToggleComplete(event.id)}
                className="h-5 w-5"
              />
            )}
            <div className="w-16 text-sm font-medium text-muted-foreground">
              {event.isAllDay ? (
                <span className="text-xs">Todo el día</span>
              ) : (
                event.startTime
              )}
            </div>
            <div className="flex-1">
              <span className={cn(
                "font-medium",
                event.completed && "line-through text-muted-foreground"
              )}>
                {event.title}
              </span>
              {event.endTime && !event.isAllDay && (
                <span className="text-xs text-muted-foreground ml-2">
                  hasta {event.endTime}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add task form */}
      {onAddEvent && (
        <div className="mt-4 pt-4 border-t">
          {!isFormExpanded ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsFormExpanded(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Añadir tarea de cuidado
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium">Nueva tarea</span>
              </div>
              <Input
                placeholder="Ej: Dar medicamento, Cambio de posición..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                autoFocus
              />
              <div className="flex gap-2">
                <Input
                  type="time"
                  placeholder="Hora (opcional)"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                >
                  Añadir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsFormExpanded(false);
                    setNewTaskTitle('');
                    setNewTaskTime('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
