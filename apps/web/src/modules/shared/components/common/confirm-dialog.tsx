"use client";

import { AlertDialog, Button } from "@heroui/react";
import { TriangleAlert } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "warning" | "danger" | "info";
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmDialogProps) {
  const iconColor = {
    warning: "text-warning",
    danger: "text-danger",
    info: "text-info",
  }[variant];

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog.Root isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Backdrop className="fixed inset-0 bg-black/40 z-200 animate-in fade-in duration-200" />
      <AlertDialog.Container
        placement="center"
        className="fixed inset-0 z-200 flex items-center justify-center w-screen h-svh p-4"
      >
        <AlertDialog.Dialog className="bg-content1 rounded-[12px] shadow-xl max-w-[400px] w-full p-6 animate-in zoom-in-95 duration-200 outline-none">
          <AlertDialog.Header className="flex flex-col gap-2">
            <div className={`flex items-center gap-2 ${iconColor}`}>
              <TriangleAlert size={24} />
              <AlertDialog.Heading className="text-[18px] font-bold text-foreground">
                {title}
              </AlertDialog.Heading>
            </div>
          </AlertDialog.Header>
          <AlertDialog.Body className="py-2">
            <p className="text-foreground-secondary text-[15px]">
              {description}
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer className="mt-4">
            <div className="flex items-center gap-3 w-full">
              <Button
                variant="secondary"
                className="flex-1 font-semibold"
                onPress={onConfirm}
              >
                {confirmLabel}
              </Button>
              <Button
                variant="ghost"
                className="flex-1 font-semibold"
                onPress={handleCancel}
              >
                {cancelLabel}
              </Button>
            </div>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Root>
  );
}
