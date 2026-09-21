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
                "flex flex-wrap items-center gap-3 rounded-xl border p-4",
                tone === "paid"
                    ? "border-grass-500/40 bg-grass-500/10"
                    : "border-amber-300 bg-amber-50",
            )}
        >
            <Icon
                className={cn(
                    "size-6 shrink-0",
                    tone === "paid" ? "text-forest-900" : "text-amber-600",
                )}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <span
                    className={cn(
                        "text-sm font-semibold",
                        tone === "paid" ? "text-forest-900" : "text-amber-800",
                    )}
                >
                    {title}
                </span>
                {description && (
                    <span className="text-xs text-muted-foreground">{description}</span>
                )}
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
        />
    ) : undefined;

    if (isLoading) {
        return <div className="h-20 animate-pulse rounded-xl bg-gray-100" />;
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
