import { CircleAlert, CircleCheck, ExternalLink, Receipt } from "lucide-react";
import { MonthSelector } from "../../../components/MonthSelector";
import { formatCurrency } from "@/src/app/utils/format-currency";
import { formatMonthName } from "@/src/app/utils/brazil-month";
import type { GroupPayment } from "@/src/app/services/groupPaymentsService";
import { RegisterPaymentModal } from "./RegisterPaymentModal";
import { useMyPaymentsController } from "./useMyPaymentsController";

const paidAtFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
});

const matchDateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
});

function paymentLabel(payment: GroupPayment, monthName: string) {
    return payment.matchId
        ? `Partida de ${matchDateFormatter.format(new Date(payment.period))}`
        : `Mensalidade de ${monthName}`;
}

export function MyPayments({ groupId }: { groupId: string }) {
    const {
        isDaily,
        canRegister,
        currentMonth,
        selectedMonth,
        setSelectedMonth,
        monthlyFeePayment,
        pendingMatchesCount,
        isLoadingStatus,
        payments,
        isLoadingPayments,
    } = useMyPaymentsController(groupId);

    const currentMonthName = formatMonthName(currentMonth);
    const selectedMonthName = formatMonthName(selectedMonth);

    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">Meus pagamentos</h2>
                {canRegister && (
                    <RegisterPaymentModal
                        groupId={groupId}
                        isDaily={isDaily}
                        monthName={currentMonthName}
                    />
                )}
            </div>

            {isLoadingStatus && (
                <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
            )}

            {!isLoadingStatus && !isDaily && monthlyFeePayment && (
                <div className="flex items-center gap-3 rounded-xl border border-grass-500/40 bg-grass-500/10 p-4">
                    <CircleCheck className="size-6 shrink-0 text-forest-900" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-forest-900">
                            Mensalidade de {currentMonthName} paga
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatCurrency(monthlyFeePayment.amount)} · registrada em{" "}
                            {paidAtFormatter.format(new Date(monthlyFeePayment.createdAt))}
                        </span>
                    </div>
                </div>
            )}

            {!isLoadingStatus && !isDaily && !monthlyFeePayment && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                    <CircleAlert className="size-6 shrink-0 text-amber-600" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-amber-800">
                            Mensalidade de {currentMonthName} pendente
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Você ainda não registrou o pagamento deste mês
                        </span>
                    </div>
                </div>
            )}

            {!isLoadingStatus && isDaily && pendingMatchesCount === 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-grass-500/40 bg-grass-500/10 p-4">
                    <CircleCheck className="size-6 shrink-0 text-forest-900" />
                    <span className="text-sm font-semibold text-forest-900">
                        Nenhuma partida pendente de pagamento
                    </span>
                </div>
            )}

            {!isLoadingStatus && isDaily && pendingMatchesCount > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                    <CircleAlert className="size-6 shrink-0 text-amber-600" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-amber-800">
                            {pendingMatchesCount}{" "}
                            {pendingMatchesCount === 1
                                ? "partida pendente"
                                : "partidas pendentes"}{" "}
                            de pagamento
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Partidas em que você jogou e ainda não pagou
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <MonthSelector
                    value={selectedMonth}
                    max={currentMonth}
                    onChange={setSelectedMonth}
                />

                {isLoadingPayments && (
                    <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                )}

                {!isLoadingPayments && payments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Nenhum pagamento seu em {selectedMonthName}
                    </p>
                )}

                {!isLoadingPayments && payments.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex items-center gap-3 rounded-lg bg-ice-100 p-3"
                            >
                                <Receipt className="size-4 shrink-0 text-primary-900" />
                                <div className="flex flex-1 flex-col">
                                    <span className="text-sm font-medium">
                                        {paymentLabel(payment, selectedMonthName)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Registrado em{" "}
                                        {paidAtFormatter.format(new Date(payment.createdAt))}
                                    </span>
                                </div>
                                {payment.receipt && (
                                    <a
                                        href={payment.receipt}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-primary-900 underline-offset-2 hover:underline"
                                    >
                                        Comprovante
                                        <ExternalLink className="size-3" />
                                    </a>
                                )}
                                <span className="text-sm font-semibold">
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
