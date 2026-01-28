"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CareCategory, CareTask, RecurringPattern } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/types";
import { Switch } from "@/components/ui/switch";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<CareTask, 'id' | 'planId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'>) => Promise<void>;
  initialDate?: string;
  editTask?: CareTask;
}

const CATEGORIES: CareCategory[] = [
  "medication",
  "hygiene",
  "nutrition",
  "mobility",
  "medical",
  "therapy",
  "monitoring",
  "emotional",
  "other",
];

const PRIORITIES: { value: CareTask["priority"]; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  initialDate,
  editTask,
}: TaskFormProps) {
  const [title, setTitle] = useState(editTask?.title || "");
  const [description, setDescription] = useState(editTask?.description || "");
  const [date, setDate] = useState(editTask?.date || initialDate || "");
  const [time, setTime] = useState(editTask?.time || "");
  const [category, setCategory] = useState<CareCategory>(editTask?.category || "other");
  const [priority, setPriority] = useState<CareTask["priority"]>(editTask?.priority || "medium");
  const [isRecurring, setIsRecurring] = useState(!!editTask?.recurring);
  const [recurringType, setRecurringType] = useState<RecurringPattern["type"]>(
    editTask?.recurring?.type || "daily"
  );
  const [recurringInterval, setRecurringInterval] = useState(
    editTask?.recurring?.interval?.toString() || "1"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);

    const taskData: Omit<CareTask, 'id' | 'planId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'completed'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      category,
      priority,
      recurring: isRecurring
        ? {
            type: recurringType,
            interval: parseInt(recurringInterval) || 1,
          }
        : undefined,
    };

    await onSubmit(taskData);
    setIsSubmitting(false);

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate(initialDate || "");
    setTime("");
    setCategory("other");
    setPriority("medium");
    setIsRecurring(false);
    setRecurringType("daily");
    setRecurringInterval("1");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editTask ? "Editar Tarea" : "Nueva Tarea"}</DialogTitle>
            <DialogDescription>
              {editTask
                ? "Modifica los detalles de la tarea."
                : "Agrega una nueva tarea de cuidado."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title">Titulo *</Label>
              <Input
                id="task-title"
                placeholder="Ej: Dar medicamento para la presion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="task-description">Descripcion</Label>
              <Input
                id="task-description"
                placeholder="Detalles adicionales..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-date">Fecha *</Label>
                <Input
                  id="task-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-time">Hora</Label>
                <Input
                  id="task-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CareCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat].bg }}
                        />
                        {CATEGORY_COLORS[cat].label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as CareTask["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recurring */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="recurring-switch">Tarea recurrente</Label>
                <Switch
                  id="recurring-switch"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label>Frecuencia</Label>
                    <Select
                      value={recurringType}
                      onValueChange={(v) => setRecurringType(v as RecurringPattern["type"])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurring-interval">
                      Cada cuantos {recurringType === "daily" ? "dias" : recurringType === "weekly" ? "semanas" : "meses"}
                    </Label>
                    <Input
                      id="recurring-interval"
                      type="number"
                      min="1"
                      max="30"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim() || !date || isSubmitting}>
              {isSubmitting ? "Guardando..." : editTask ? "Guardar" : "Crear Tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
