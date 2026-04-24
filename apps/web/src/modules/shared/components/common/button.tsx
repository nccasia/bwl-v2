import * as React from "react"
import { Button as HeroUIButton } from "@heroui/react"
import { cn } from "@/utils/utils"

type ButtonProps = React.ComponentProps<typeof HeroUIButton>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <HeroUIButton
        ref={ref}
        className={cn("font-medium", className)}
        {...props}
      >
        {children}
      </HeroUIButton>
    )
  }
)

Button.displayName = "Button"

export { Button }
