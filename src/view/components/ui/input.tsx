import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/src/app/utils/cn.ts"
interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  icon?: LucideIcon;
}
function Input({ className, type, icon: Icon, ...props }: InputProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full")}>
      {props.label && (
        <label className="text-xs text-strong" htmlFor={props.id}>{props.label}</label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        )}
        <InputPrimitive
          type={type}
          data-slot="input"
          className={cn(
            "h-9 w-full min-w-0 rounded-md border border-line-strong bg-input/50 px-3 py-1 text-base transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            Icon && "pl-9",
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
}

export { Input }
