import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border-0 bg-[oklch(var(--background)/0.94)] px-3 py-2 text-base text-foreground placeholder:text-[oklch(var(--muted-foreground)/0.78)] shadow-none outline-none transition-[color,background,border,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:ring-2 focus-visible:ring-[oklch(var(--primary)/0.45)] focus-visible:ring-offset-1 focus-visible:ring-offset-[oklch(var(--background))]",
        "aria-invalid:bg-[oklch(var(--destructive)/0.06)] aria-invalid:ring-[oklch(var(--destructive)/0.45)] aria-invalid:ring-2",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
