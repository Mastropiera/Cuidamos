"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CarePlan } from "@/lib/types";
import { Copy, Check, RefreshCw, Users } from "lucide-react";

interface SharePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: CarePlan;
  onGenerateInvite: () => Promise<string | null>;
}

export function SharePlanDialog({
  open,
  onOpenChange,
  plan,
  onGenerateInvite,
}: SharePlanDialogProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(plan.inviteCode || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isExpired = plan.inviteExpiresAt
    ? new Date(plan.inviteExpiresAt) < new Date()
    : true;

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    const code = await onGenerateInvite();
    if (code) {
      setInviteCode(code);
    }
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const displayCode = !isExpired && inviteCode ? inviteCode : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartir Plan</DialogTitle>
          <DialogDescription>
            Comparte &quot;{plan.name}&quot; con otros cuidadores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invite Code Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Codigo de Invitacion</h4>
            {displayCode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                  <span className="text-2xl font-mono font-bold tracking-widest">
                    {displayCode}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Este codigo expira en 24 horas
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleGenerateInvite}
                  disabled={isGenerating}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                  Generar nuevo codigo
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  {isExpired && plan.inviteCode
                    ? "El codigo anterior ha expirado."
                    : "Genera un codigo para invitar colaboradores."}
                </p>
                <Button
                  onClick={handleGenerateInvite}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generando..." : "Generar Codigo"}
                </Button>
              </div>
            )}
          </div>

          {/* Collaborators Section */}
          {plan.collaboratorEmails.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Colaboradores ({plan.collaboratorEmails.length})
              </h4>
              <ul className="space-y-1">
                {plan.collaboratorEmails.map((email) => (
                  <li
                    key={email}
                    className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded"
                  >
                    {email}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
