import * as React from "react"
import {
  Card as HeroUICard,
  CardHeader as HeroUICardHeader,
  CardFooter as HeroUICardFooter,
  CardTitle as HeroUICardTitle,
  CardDescription as HeroUICardDescription,
  CardContent as HeroUICardContent,
} from "@heroui/react"
import { cn } from "@/utils/utils"

type CardProps = React.ComponentProps<typeof HeroUICard>

function Card({
  className,
  children,
  ...props
}: CardProps) {
  return (
    <HeroUICard
      className={cn("w-full group/card", className)}
      {...props}
    >
      {children}
    </HeroUICard>
  )
}

function CardHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <HeroUICardHeader
      className={cn("flex flex-col items-start gap-1 p-4", className)}
      {...props}
    >
      {children}
    </HeroUICardHeader>
  )
}

function CardTitle({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <HeroUICardTitle
      className={cn("text-lg font-bold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </HeroUICardTitle>
  )
}

function CardDescription({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <HeroUICardDescription
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </HeroUICardDescription>
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "absolute right-4 top-4",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <HeroUICardContent
      className={cn("p-4 pt-0", className)}
      {...props}
    >
      {children}
    </HeroUICardContent>
  )
}

function CardFooter({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <HeroUICardFooter
      className={cn("flex items-center p-4 border-t", className)}
      {...props}
    >
      {children}
    </HeroUICardFooter>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
