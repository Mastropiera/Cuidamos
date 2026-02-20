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
import { ColorPicker } from "@/components/ui/color-picker";
import type { UserRole, Member } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";
import type { CreateMemberData } from "@/hooks/useMembers";

interface CreateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMemberData) => Promise<string | null>;
  existingMembers: Member[];
}

const ROLES: UserRole[] = ['cuidadora', 'enfermera', 'coordinadora'];

export function CreateMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  existingMembers,
}: CreateMemberDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("cuidadora");
  const [color, setColor] = useState<string | null>(null);
  const [canCoordinate, setCanCoordinate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usedColors = existingMembers
    .filter((m) => m.color)
    .map((m) => m.color!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    const result = await onSubmit({ name, email, phone, role, color, canCoordinate: role === 'enfermera' ? canCoordinate : false });
    setIsSubmitting(false);

    if (result) {
      resetForm();
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setRole("cuidadora");
    setColor(null);
    setCanCoordinate(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar miembro</DialogTitle>
            <DialogDescription>
              Registra una nueva persona en tu equipo. Cuando inicie sesion con Google usando este email, se le asignara su rol automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Nombre completo *</Label>
              <Input
                id="member-name"
                placeholder="Ej: Maria Garcia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-email">Email *</Label>
              <Input
                id="member-email"
                type="email"
                placeholder="maria@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-phone">Telefono</Label>
              <Input
                id="member-phone"
                type="tel"
                placeholder="+54 11 1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === "cuidadora" && (
              <div className="space-y-2">
                <Label>Color identificativo</Label>
                <ColorPicker
                  value={color}
                  onChange={setColor}
                  usedColors={usedColors}
                />
              </div>
            )}

            {role === "enfermera" && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="can-coordinate"
                  checked={canCoordinate}
                  onChange={(e) => setCanCoordinate(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="can-coordinate" className="text-sm font-normal">
                  Permisos de coordinadora (gestionar equipo, eliminar pacientes)
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !email.trim() || isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
