"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskForm } from "./task-form";
import type { CareTask, CarePlan } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";
import { Plus, Trash2, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskListProps {
  plan: CarePlan;
  tasks: CareTask[];
  selectedDate: string;
  onCreateTask: (data: Omit<CareTask, 'id' | 'planId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>) => Promise<string | null>;
  onToggleComplete: (taskId: string) => Promise<boolean>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
}

export function TaskList({
  plan,
  tasks,
  selectedDate,
  onCreateTask,
  onToggleComplete,
  onDeleteTask,
}: TaskListProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  // Filter tasks for selected date
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const pendingTasks = dayTasks.filter((t) => !t.completed);
  const completedTasks = dayTasks.filter((t) => t.completed);

  const handleCreateTask = async (
    data: Omit<CareTask, 'id' | 'planId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>
  ) => {
    const result = await onCreateTask(data);
    if (result) {
      setShowTaskForm(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTaskId) return;
    await onDeleteTask(deleteTaskId);
    setDeleteTaskId(null);
  };

  const getPriorityIcon = (priority: CareTask["priority"]) => {
    if (priority === "high") {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const renderTask = (task: CareTask) => {
    const categoryStyle = CATEGORY_COLORS[task.category];

    return (
      <div
        key={task.id}
        className={`flex items-start gap-3 p-3 rounded-lg border ${
          task.completed ? "bg-muted/50 opacity-60" : "bg-card"
        }`}
      >
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </span>
            {getPriorityIcon(task.priority)}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: categoryStyle.bg, color: categoryStyle.text }}
            >
              {categoryStyle.label}
            </span>
            {task.time && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.time}
              </span>
            )}
            {task.recurring && (
              <span className="text-xs text-muted-foreground">
                (Recurrente)
              </span>
            )}
          </div>
          {task.completed && task.completedByEmail && (
            <p className="text-xs text-muted-foreground mt-1">
              Completado por: {task.completedByEmail}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => setDeleteTaskId(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Tareas - {format(new Date(selectedDate + "T12:00:00"), "d 'de' MMMM", { locale: es })}
          </CardTitle>
          <Button size="sm" onClick={() => setShowTaskForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{plan.name}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {dayTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay tareas para este dia.
          </p>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Pendientes ({pendingTasks.length})
                </h4>
                <div className="space-y-2">
                  {pendingTasks
                    .sort((a, b) => (a.time || "").localeCompare(b.time || ""))
                    .map(renderTask)}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Completadas ({completedTasks.length})
                </h4>
                <div className="space-y-2">
                  {completedTasks.map(renderTask)}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Task Form Dialog */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        onSubmit={handleCreateTask}
        initialDate={selectedDate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTaskId} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Tarea</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTaskId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
