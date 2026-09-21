import { MonthSelector } from "../../../components/MonthSelector";
import { formatMonthName } from "@/src/app/utils/brazil-month";
import { formatRegisteredAt, paymentLabel } from "../payment-labels";
import { PaymentRow } from "../PaymentRow";
import { useMyPaymentsHistoryController } from "./useMyPaymentsHistoryController";

export function MyPaymentsHistory({ groupId }: { groupId: string }) {
    const { currentMonth, selectedMonth, setSelectedMonth, payments, isLoading } =
        useMyPaymentsHistoryController(groupId);

    const monthName = formatMonthName(selectedMonth);

    return (
        <div className="flex flex-col gap-3">
            <MonthSelector
                value={selectedMonth}
                max={currentMonth}
                onChange={setSelectedMonth}
            />

            {isLoading && <div className="h-16 animate-pulse rounded-lg bg-primary-100" />}

            {!isLoading && payments.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Nenhum pagamento seu em {monthName}
                </p>
            )}

            {!isLoading && payments.length > 0 && (
                <div className="flex flex-col gap-2">
                    {payments.map((payment) => (
                        <PaymentRow
                            key={payment.id}
                            title={paymentLabel(payment, monthName)}
                            subtitle={`Registrado em ${formatRegisteredAt(payment.createdAt)}`}
                            receipt={payment.receipt}
                            amount={payment.amount}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
