"use client";

import { Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleBadge } from "./role-badge";
import type { AppUser } from "@/lib/types";

interface AppShellProps {
  appUser: AppUser;
  orgName?: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppShell({ appUser, orgName, onLogout, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary fill-primary/20" />
              <h1 className="text-2xl font-bold text-primary">Cuidamos</h1>
              {orgName && (
                <span className="hidden sm:inline text-sm text-muted-foreground ml-2">
                  — {orgName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {appUser.role && <RoleBadge role={appUser.role} />}
              <span className="text-sm text-muted-foreground hidden sm:block">
                {appUser.displayName || appUser.email}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
