import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-base text-foreground transition-all duration-200 outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-white/20 hover:bg-white/[0.07]",
        "focus:border-primary/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20",
        "file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white file:rounded-lg file:cursor-pointer",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
