"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemberCard } from "./member-card";
import { CreateMemberDialog } from "./create-member-dialog";
import { EditMemberDialog } from "./edit-member-dialog";
import { Plus, Users } from "lucide-react";
import type { Member } from "@/lib/types";
import type { CreateMemberData } from "@/hooks/useMembers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MemberListProps {
  members: Member[];
  canManage: boolean;
  onCreateMember: (data: CreateMemberData) => Promise<string | null>;
  onUpdateMember: (
    memberId: string,
    data: Partial<Pick<Member, 'name' | 'phone' | 'role' | 'color' | 'active'>>
  ) => Promise<boolean>;
  onDeleteMember: (memberId: string) => Promise<boolean>;
}

export function MemberList({
  members,
  canManage,
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
}: MemberListProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const handleDelete = async () => {
    if (!deleteMember) return;
    await onDeleteMember(deleteMember.id);
    setDeleteMember(null);
  };

  const activeMembers = members.filter((m) => m.active);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Equipo ({activeMembers.length})</CardTitle>
          </div>
          {canManage && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeMembers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay miembros en el equipo. Agrega cuidadoras y enfermeras.
          </p>
        ) : (
          activeMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              canManage={canManage}
              onEdit={setEditMember}
              onDelete={setDeleteMember}
            />
          ))
        )}
      </CardContent>

      <CreateMemberDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSubmit={onCreateMember}
        existingMembers={members}
      />

      <EditMemberDialog
        open={!!editMember}
        onOpenChange={(open) => !open && setEditMember(null)}
        member={editMember}
        onSubmit={onUpdateMember}
        existingMembers={members}
      />

      <Dialog open={!!deleteMember} onOpenChange={(open) => !open && setDeleteMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar miembro</DialogTitle>
            <DialogDescription>
              Se eliminara a {deleteMember?.name} del equipo. Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMember(null)}>
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
