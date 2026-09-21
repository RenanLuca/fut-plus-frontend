import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/src/app/utils/cn";
import { formatCurrency } from "@/src/app/utils/format-currency";
import { formatMonthName } from "@/src/app/utils/brazil-month";
import { formatRegisteredAt } from "../payment-labels";
import { RegisterPaymentModal } from "./RegisterPaymentModal";
import { useMyPaymentStatusController } from "./useMyPaymentStatusController";

function StatusCard({
    tone,
    title,
    description,
    action,
}: {
    tone: "paid" | "pending";
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    const Icon = tone === "paid" ? CircleCheck : CircleAlert;

    return (
        <div
            className={cn(
                "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center",
                tone === "paid"
                    ? "border-grass-500/40 bg-grass-500/10 dark:border-grass-500/30"
                    : "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10",
            )}
        >
            <div className="flex flex-1 items-start gap-3 sm:items-center">
                <Icon
                    className={cn(
                        "size-6 shrink-0",
                        tone === "paid"
                        ? "text-forest-900 dark:text-grass-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                    <span
                        className={cn(
                            "text-sm font-semibold",
                            tone === "paid"
                            ? "text-forest-900 dark:text-grass-300"
                            : "text-amber-800 dark:text-amber-200",
                        )}
                    >
                        {title}
                    </span>
                    {description && (
                        <span className="text-xs text-muted-foreground">{description}</span>
                    )}
                </div>
            </div>
            {action}
        </div>
    );
}

export function MyPaymentStatus({ groupId }: { groupId: string }) {
    const {
        isDaily,
        canRegister,
        currentMonth,
        monthlyFeePayment,
        pendingMatchesCount,
        isLoading,
    } = useMyPaymentStatusController(groupId);

    const monthName = formatMonthName(currentMonth);
    const registerAction = canRegister ? (
        <RegisterPaymentModal
            groupId={groupId}
            isDaily={isDaily}
            monthName={monthName}
            className="w-full sm:w-auto"
        />
    ) : undefined;

    if (isLoading) {
        return <div className="h-20 animate-pulse rounded-xl bg-soft-strong" />;
    }

    if (isDaily) {
        return pendingMatchesCount === 0 ? (
            <StatusCard tone="paid" title="Nenhuma partida pendente de pagamento" />
        ) : (
            <StatusCard
                tone="pending"
                title={`${pendingMatchesCount} ${
                    pendingMatchesCount === 1 ? "partida pendente" : "partidas pendentes"
                } de pagamento`}
                description="Partidas em que você jogou e ainda não pagou"
                action={registerAction}
            />
        );
    }

    return monthlyFeePayment ? (
        <StatusCard
            tone="paid"
            title={`Mensalidade de ${monthName} paga`}
            description={`${formatCurrency(monthlyFeePayment.amount)} · registrada em ${formatRegisteredAt(monthlyFeePayment.createdAt)}`}
        />
    ) : (
        <StatusCard
            tone="pending"
            title={`Mensalidade de ${monthName} pendente`}
            description="Você ainda não registrou o pagamento deste mês"
            action={registerAction}
        />
    );
}
