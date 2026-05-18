import React from "react";
import { cn } from "@/utils/utils";
import { Card } from "@heroui/react";
import { WidgetCardProps } from "@/modules/shared/types";

export function WidgetCard({ 
  children, 
  className, 
  noPadding = false,
  ...props 
}: WidgetCardProps) {

  return (
    <Card 
      className={cn(
        "bg-content1 border border-divider shadow-sm rounded-3xl overflow-hidden",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
