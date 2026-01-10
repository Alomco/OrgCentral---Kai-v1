import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border-0 bg-[hsl(var(--background)/0.94)] px-3 py-1 text-base text-foreground placeholder:text-[hsl(var(--muted-foreground)/0.78)] transition-[color,background,border,box-shadow] outline-none shadow-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.45)] focus-visible:ring-offset-1 focus-visible:ring-offset-[hsl(var(--background))]",
        "aria-invalid:bg-[hsl(var(--destructive)/0.06)] aria-invalid:ring-[hsl(var(--destructive)/0.45)] aria-invalid:ring-2",
        className
      )}
      {...props}
    />
  )
}

export { Input }
