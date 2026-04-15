import React from "react";
import { CardProps, Alert as HeroUIAlert } from "@heroui/react";

export interface WidgetCardProps extends CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export interface AlertProps extends React.ComponentProps<typeof HeroUIAlert> {
  variant?: "default" | "destructive";
}

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  size?: number;
}

export interface SidebarItem {
  icon: React.ElementType;
  translationKey: string;
  href: string;
}

