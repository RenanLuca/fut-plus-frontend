import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "@/src/app/hooks/useTheme";
import type { ThemeMode } from "@/src/app/contexts/ThemeContext";
import { cn } from "@/src/app/utils/cn";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: LucideIcon }[] = [
    { value: "system", label: "Sistema", icon: Monitor },
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
];

export function AppearanceSection() {
    const { theme, setTheme } = useTheme();

    return (
        <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-medium">Aparência</h2>
            <div
                role="radiogroup"
                aria-label="Tema do app"
                className="grid grid-cols-3 gap-1 rounded-xl bg-soft p-1"
            >
                {THEME_OPTIONS.map((option) => {
                    const selected = theme === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setTheme(option.value)}
                            className={cn(
                                "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                                selected
                                    ? "bg-surface text-heading shadow-sm"
                                    : "text-medium hover:text-heading",
                            )}
                        >
                            <option.icon className="size-4" />
                            {option.label}
                        </button>
                    );
                })}
            </div>
            <p className="text-xs text-muted-foreground">
                "Sistema" acompanha a configuração do seu aparelho.
            </p>
        </section>
    );
}
