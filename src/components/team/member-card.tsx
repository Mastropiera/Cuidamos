"use client";

import { Button } from "@/components/ui/button";
import { RoleBadge } from "@/components/layout/role-badge";
import { Pencil, Trash2, Phone, Mail, User } from "lucide-react";
import type { Member } from "@/lib/types";

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  canManage: boolean;
}

export function MemberCard({ member, onEdit, onDelete, canManage }: MemberCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      {/* Color dot for cuidadoras */}
      <div className="flex-shrink-0">
        {member.color ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: member.color }}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{member.name}</span>
          <RoleBadge role={member.role} />
          {!member.active && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              Inactivo
            </span>
          )}
          {member.uid && (
            <span className="text-xs text-green-600" title="Ya inicio sesion">
              ●
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 truncate">
            <Mail className="h-3 w-3" />
            {member.email}
          </span>
          {member.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {member.phone}
            </span>
          )}
        </div>
      </div>

      {canManage && (
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(member)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(member)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
