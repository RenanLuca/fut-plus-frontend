import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { cn } from "@/src/app/utils/cn";
import { Input } from "./ui/input";

type PasswordInputProps = Omit<
    ComponentProps<typeof Input>,
    "type" | "endAdornment"
>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);
    const ToggleIcon = visible ? EyeOff : Eye;

    return (
        <Input
            {...props}
            type={visible ? "text" : "password"}
            className={cn("pr-10", className)}
            endAdornment={
                <button
                    type="button"
                    aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={visible}
                    // evita tirar o foco do campo ao clicar no olho
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setVisible((current) => !current)}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-heading focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
                >
                    <ToggleIcon className="size-4" />
                </button>
            }
        />
    );
}
