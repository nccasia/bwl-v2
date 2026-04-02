import * as React from "react"
import { Button as HeroUIButton } from "@heroui/react"
import { cn } from "@/utils/utils"

type ButtonProps = React.ComponentProps<typeof HeroUIButton>

function Button({
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <HeroUIButton
      className={cn("font-medium", className)}
      {...props}
    >
      {children}
    </HeroUIButton>
  )
}

export { Button }
