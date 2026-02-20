"use client";

import { useState, useEffect } from "react";
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

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSubmit: (
    memberId: string,
    data: Partial<Pick<Member, 'name' | 'phone' | 'role' | 'color' | 'active'>>
  ) => Promise<boolean>;
  existingMembers: Member[];
}

const ROLES: UserRole[] = ['cuidadora', 'enfermera', 'coordinadora'];

export function EditMemberDialog({
  open,
  onOpenChange,
  member,
  onSubmit,
  existingMembers,
}: EditMemberDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("cuidadora");
  const [color, setColor] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPhone(member.phone);
      setRole(member.role);
      setColor(member.color);
    }
  }, [member]);

  const usedColors = existingMembers
    .filter((m) => m.color && m.id !== member?.id)
    .map((m) => m.color!);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !name.trim()) return;

    setIsSubmitting(true);
    const result = await onSubmit(member.id, {
      name: name.trim(),
      phone: phone.trim(),
      role,
      color: role === 'cuidadora' ? color : null,
    });
    setIsSubmitting(false);

    if (result) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar miembro</DialogTitle>
            <DialogDescription>
              Modifica los datos de {member?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-member-name">Nombre completo *</Label>
              <Input
                id="edit-member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={member?.email || ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-member-phone">Telefono</Label>
              <Input
                id="edit-member-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
