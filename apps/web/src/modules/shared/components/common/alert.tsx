import * as React from "react";
import {
  Alert as HeroUIAlert,
  AlertTitle as HeroUIAlertTitle,
  AlertDescription as HeroUIAlertDescription,
} from "@heroui/react";
import { cn } from "@/utils/utils";
import { AlertProps } from "@/modules/shared/types";

function Alert({ variant, status, children, className, ...props }: AlertProps) {
  const finalStatus =
    status || (variant === "destructive" ? "danger" : "default");

  return (
    <HeroUIAlert
      status={finalStatus}
      className={cn("w-full items-start", className)}
      {...props}
    >
      {children}
    </HeroUIAlert>
  );
}

function AlertTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <HeroUIAlertTitle className={cn("font-medium", className)} {...props}>
      {children}
    </HeroUIAlertTitle>
  );
}

function AlertDescription({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <HeroUIAlertDescription
      className={cn("text-sm opacity-90", className)}
      {...props}
    >
      {children}
    </HeroUIAlertDescription>
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
