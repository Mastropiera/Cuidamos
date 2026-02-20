"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { Organization, Member, EmailMapping } from "@/lib/types";

export function OnboardingView() {
  const { appUser, refreshAppUser, logout } = useAuth();
  const [orgName, setOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !appUser || !db) return;

    setIsCreating(true);
    setError(null);

    try {
      const orgId = crypto.randomUUID();
      const memberId = crypto.randomUUID();
      const now = new Date().toISOString();
      const emailKey = appUser.email.toLowerCase().trim();

      const org: Organization = {
        id: orgId,
        name: orgName.trim(),
        createdBy: appUser.uid,
        createdAt: now,
        updatedAt: now,
      };

      const member: Member = {
        id: memberId,
        uid: appUser.uid,
        email: emailKey,
        name: appUser.displayName || appUser.email,
        phone: '',
        role: 'coordinadora',
        color: null,
        canCoordinate: false,
        active: true,
        createdAt: now,
        updatedAt: now,
      };

      const emailMapping: EmailMapping = {
        orgId,
        memberId,
        role: 'coordinadora',
        createdAt: now,
      };

      // Write all three docs
      await Promise.all([
        setDoc(doc(db, "organizations", orgId), org),
        setDoc(doc(db, "organizations", orgId, "members", memberId), member),
        setDoc(doc(db, "emailMappings", emailKey), emailMapping),
      ]);

      // Refresh the app user context so the app picks up the new org/role
      await refreshAppUser();
    } catch (err) {
      console.error("Error creating organization:", err);
      setError("Error al crear la organizacion. Intenta de nuevo.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-2">
              <Heart className="h-10 w-10 text-primary fill-primary/20" />
              <h1 className="text-3xl font-bold text-primary">Cuidamos</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Bienvenida</h2>
              <p className="text-muted-foreground text-sm">
                Para comenzar, crea tu organizacion. Como coordinadora podras registrar
                enfermeras, cuidadoras y pacientes.
              </p>
            </div>

            <form onSubmit={handleCreateOrg} className="w-full space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="org-name">Nombre de la organizacion</Label>
                <Input
                  id="org-name"
                  placeholder="Ej: Cuidados de mamá"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!orgName.trim() || isCreating}
              >
                {isCreating ? "Creando..." : "Crear organizacion"}
              </Button>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </form>

            <div className="pt-2 border-t w-full">
              <p className="text-xs text-muted-foreground mb-2">
                Conectada como {appUser?.email}
              </p>
              <Button variant="ghost" size="sm" onClick={logout}>
                Cerrar sesion
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
