"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarRange, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarViewType = 'daily' | 'weekly' | 'monthly';

interface ViewNavigationProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

const views: { id: CalendarViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'daily', label: 'Diario', icon: <Calendar className="h-4 w-4" /> },
  { id: 'weekly', label: 'Semanal', icon: <CalendarRange className="h-4 w-4" /> },
  { id: 'monthly', label: 'Mensual', icon: <CalendarDays className="h-4 w-4" /> },
];

export function ViewNavigation({ currentView, onViewChange }: ViewNavigationProps) {
  return (
    <div className="flex justify-center gap-1 p-1 bg-muted rounded-lg">
      {views.map((view) => (
        <Button
          key={view.id}
          variant={currentView === view.id ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewChange(view.id)}
          className={cn(
            "flex items-center gap-2 transition-all",
            currentView === view.id && "shadow-sm"
          )}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </Button>
      ))}
    </div>
  );
}
