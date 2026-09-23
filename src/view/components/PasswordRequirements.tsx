import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES } from "@/src/app/schemas/password.schema";
import { cn } from "@/src/app/utils/cn";

type PasswordRequirementsProps = {
    password: string;
};

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
    if (!password) return null;

    return (
        <ul className="flex flex-col gap-1">
            {PASSWORD_RULES.map((rule) => {
                const met = rule.test(password);
                return (
                    <li
                        key={rule.id}
                        className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            met
                                ? "text-green-600 dark:text-green-400"
                                : "text-muted-foreground",
                        )}
                    >
                        {met ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
                        {rule.label}
                    </li>
                );
            })}
        </ul>
    );
}
