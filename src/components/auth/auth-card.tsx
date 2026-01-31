"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function AuthCard() {
  const { loginWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("Login error:", err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-2">
              <Heart className="h-10 w-10 text-primary fill-primary/20" />
              <h1 className="text-3xl font-bold text-primary">Cuidamos</h1>
            </div>
            <p className="text-muted-foreground">
              Planificacion de cuidados colaborativa
            </p>
            <Button
              onClick={handleLogin}
              disabled={isSigningIn}
              className="w-full"
              size="lg"
            >
              {isSigningIn ? "Conectando..." : "Iniciar sesion con Google"}
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
