"use client";

import { CUIDADORA_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string | null;
  onChange: (color: string) => void;
  usedColors?: string[];
}

export function ColorPicker({ value, onChange, usedColors = [] }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CUIDADORA_COLORS.map((color) => {
        const isUsed = usedColors.includes(color) && color !== value;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
              value === color ? "border-foreground scale-110" : "border-transparent",
              isUsed && "opacity-30"
            )}
            style={{ backgroundColor: color }}
            title={isUsed ? "Color ya asignado" : undefined}
          >
            {value === color && <Check className="h-4 w-4 text-white" />}
          </button>
        );
      })}
    </div>
  );
}
