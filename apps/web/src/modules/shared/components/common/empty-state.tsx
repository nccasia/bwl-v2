import React from "react";
import { cn } from "@/utils/utils";

import { EmptyStateProps } from "@/modules/shared/types";

export function EmptyState({ 
  icon, 
  title, 
  description, 
  className 
}: EmptyStateProps) {

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 rounded-3xl bg-content2/30 border border-divider border-dashed text-center",
      className
    )}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-300">
          <div className="text-3xl opacity-60 grayscale hover:grayscale-0 transition-all">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-foreground font-bold text-base tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground/60 text-sm mt-1.5 max-w-[240px] mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
