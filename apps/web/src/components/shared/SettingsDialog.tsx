"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCustomColor } from "@/components/theme/CustomColorProvider";
import { Palette, RotateCcw, Check } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Cyan", value: "#06b6d4" },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { accentColor, setAccentColor, resetAccentColor } = useCustomColor();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Palette className="w-5 h-5 text-accent" />
            Cài đặt giao diện
          </DialogTitle>
          <DialogDescription>
            Tùy chỉnh màu sắc hiển thị của ứng dụng theo phong cách của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Màu chủ đạo (Accent Color)</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetAccentColor}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Mặc định
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccentColor(color.value)}
                  className={`group relative h-10 w-full rounded-lg transition-all duration-200 border-2 ${
                    accentColor === color.value 
                      ? "border-accent scale-105 shadow-lg" 
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {accentColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/10 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="custom-color" className="text-sm font-semibold">Màu tùy chỉnh (Hex)</Label>
            <div className="flex gap-2">
              <div 
                className="w-10 h-10 rounded-lg border border-border shrink-0" 
                style={{ backgroundColor: accentColor }} 
              />
              <Input
                id="custom-color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#8b5cf6"
                className="font-mono bg-muted/50"
              />
            </div>
          </div>
          
          <Separator className="bg-border/50" />
          
          <div className="flex justify-end pt-2">
            <Button 
              onClick={() => onOpenChange(false)}
              className="bg-accent hover:bg-accent-hover text-accent-foreground font-bold px-8"
            >
              Hoàn tất
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
