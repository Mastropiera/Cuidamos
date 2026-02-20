"use client";

import type { UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";

const ROLE_STYLES: Record<UserRole, string> = {
  coordinadora: "bg-purple-100 text-purple-800",
  enfermera: "bg-blue-100 text-blue-800",
  cuidadora: "bg-green-100 text-green-800",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLES[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}
