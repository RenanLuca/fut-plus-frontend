import type { CurrentUser } from "@/src/app/services/usersService";
import { cn } from "@/src/app/utils/cn";
import { useNotificationsController } from "./useNotificationsController";

export function NotificationsSection({ user }: { user: CurrentUser }) {
    const { enabled, onToggle, isPending } = useNotificationsController(user);

    return (
        <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-medium">Notificações</h2>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-soft p-3">
                <div className="flex flex-col">
                    <span id="email-notifications-label" className="text-sm font-medium text-heading">
                        Emails de partida aberta
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Receba um email quando uma nova partida for criada nos seus grupos.
                    </span>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-labelledby="email-notifications-label"
                    disabled={isPending}
                    onClick={onToggle}
                    className={cn(
                        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        enabled ? "bg-primary" : "bg-soft-strong",
                    )}
                >
                    <span
                        className={cn(
                            "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                            enabled && "translate-x-5",
                        )}
                    />
                </button>
            </div>
        </section>
    );
}
