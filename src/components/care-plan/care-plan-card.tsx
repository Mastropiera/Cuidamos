"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CarePlan, CareTask } from "@/lib/types";
import { Users, Calendar, Share2, Trash2, LogOut } from "lucide-react";

interface CarePlanCardProps {
  plan: CarePlan;
  tasks: CareTask[];
  isOwner: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onShare: () => void;
  onDelete: () => void;
  onLeave: () => void;
}

export function CarePlanCard({
  plan,
  tasks,
  isOwner,
  isSelected,
  onSelect,
  onShare,
  onDelete,
  onLeave,
}: CarePlanCardProps) {
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const collaboratorCount = plan.collaborators.length;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            {plan.patientName && (
              <CardDescription>Paciente: {plan.patientName}</CardDescription>
            )}
          </div>
          <div className="flex gap-1">
            {isOwner ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  title="Compartir plan"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  title="Eliminar plan"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeave();
                }}
                title="Salir del plan"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {plan.description && (
          <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {pendingTasks} pendiente{pendingTasks !== 1 && "s"}
              {completedTasks > 0 && `, ${completedTasks} completada${completedTasks !== 1 ? "s" : ""}`}
            </span>
          </div>
          {collaboratorCount > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{collaboratorCount + 1} persona{collaboratorCount > 0 && "s"}</span>
            </div>
          )}
        </div>
        {!isOwner && (
          <p className="text-xs text-muted-foreground mt-2">
            Creado por: {plan.ownerEmail}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
