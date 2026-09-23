import type { LucideIcon } from "lucide-react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cn } from "@/src/app/utils/cn"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  icon: Icon,
  iconClassName,
  children,
  ...props
}: RadioPrimitive.Root.Props & { icon?: LucideIcon; iconClassName?: string }) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border border-transparent bg-input/50 px-3 py-2.5 text-sm font-medium outline-none transition-[color,box-shadow,background-color] focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-ring data-checked:bg-accent data-checked:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-muted-foreground/50 group-data-checked:border-primary">
        <RadioPrimitive.Indicator className="size-2 rounded-full bg-primary" />
      </span>
      {Icon && (
        <Icon className={cn("size-4 shrink-0 text-muted-foreground", iconClassName)} />
      )}
      <span className="flex-1 text-left">{children}</span>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
