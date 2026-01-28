"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CarePlanCard } from "./care-plan-card";
import { CreatePlanDialog } from "./create-plan-dialog";
import { SharePlanDialog } from "./share-plan-dialog";
import type { CarePlan, CareTask } from "@/lib/types";
import { Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CarePlanListProps {
  plans: CarePlan[];
  tasks: Record<string, CareTask[]>;
  userId: string;
  selectedPlanId: string | null;
  onSelectPlan: (planId: string | null) => void;
  onCreatePlan: (data: { name: string; description?: string; patientName?: string }) => Promise<string | null>;
  onDeletePlan: (planId: string) => Promise<boolean>;
  onGenerateInvite: (planId: string) => Promise<string | null>;
  onJoinWithInvite: (code: string) => Promise<boolean>;
  onLeavePlan: (planId: string) => Promise<boolean>;
}

export function CarePlanList({
  plans,
  tasks,
  userId,
  selectedPlanId,
  onSelectPlan,
  onCreatePlan,
  onDeletePlan,
  onGenerateInvite,
  onJoinWithInvite,
  onLeavePlan,
}: CarePlanListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sharePlanId, setSharePlanId] = useState<string | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setIsJoining(true);
    setJoinError(null);

    const success = await onJoinWithInvite(joinCode);

    setIsJoining(false);
    if (success) {
      setShowJoinDialog(false);
      setJoinCode("");
    } else {
      setJoinError("Codigo invalido o expirado");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    await onDeletePlan(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const sharePlan = plans.find((p) => p.id === sharePlanId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Planes de Cuidado</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJoinDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-1" />
            Unirse
          </Button>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Crear Plan
          </Button>
        </div>
      </div>

      {/* Plan list */}
      {plans.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tienes planes de cuidado.</p>
          <p className="text-sm mt-1">
            Crea uno nuevo o unete con un codigo de invitacion.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <CarePlanCard
              key={plan.id}
              plan={plan}
              tasks={tasks[plan.id] || []}
              isOwner={plan.ownerId === userId}
              isSelected={selectedPlanId === plan.id}
              onSelect={() => onSelectPlan(selectedPlanId === plan.id ? null : plan.id)}
              onShare={() => setSharePlanId(plan.id)}
              onDelete={() => setDeleteConfirmId(plan.id)}
              onLeave={() => onLeavePlan(plan.id)}
            />
          ))}
        </div>
      )}

      {/* Create Plan Dialog */}
      <CreatePlanDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={async (data) => {
          const result = await onCreatePlan(data);
          if (result) {
            setShowCreateDialog(false);
          }
        }}
      />

      {/* Share Plan Dialog */}
      {sharePlan && (
        <SharePlanDialog
          open={!!sharePlanId}
          onOpenChange={(open) => !open && setSharePlanId(null)}
          plan={sharePlan}
          onGenerateInvite={() => onGenerateInvite(sharePlan.id)}
        />
      )}

      {/* Join Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unirse a un Plan</DialogTitle>
            <DialogDescription>
              Ingresa el codigo de invitacion de 6 caracteres.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Codigo de Invitacion</Label>
              <Input
                id="invite-code"
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError(null);
                }}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              {joinError && (
                <p className="text-sm text-destructive">{joinError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJoinDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleJoin}
              disabled={joinCode.length !== 6 || isJoining}
            >
              {isJoining ? "Uniendo..." : "Unirse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Plan</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminaran todas las tareas asociadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
