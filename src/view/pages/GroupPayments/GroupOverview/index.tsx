import { CircleAlert, CircleCheck, ExternalLink } from "lucide-react";
import { MonthSelector } from "../../../components/MonthSelector";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { GROUP_MEMBER_TYPE_LABELS } from "@/src/app/constants/groupMemberType";
import { formatMonthName } from "@/src/app/utils/brazil-month";
import { formatCurrency } from "@/src/app/utils/format-currency";
import { getInitials } from "@/src/app/utils/get-initials";
import { formatRegisteredAt, paymentLabel } from "../payment-labels";
import { PaymentRow } from "../PaymentRow";
import { useGroupOverviewController } from "./useGroupOverviewController";

export function GroupOverview({ groupId }: { groupId: string }) {
    const {
        currentMonth,
        selectedMonth,
        setSelectedMonth,
        isLoading,
        checklist,
        paidCount,
        collected,
        expected,
        oneOffTotal,
        oneOffPayments,
        isTruncated,
        getMemberName,
    } = useGroupOverviewController(groupId);

    const monthName = formatMonthName(selectedMonth);

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-700">Pagamentos do grupo</h2>

            <MonthSelector
                value={selectedMonth}
                max={currentMonth}
                onChange={setSelectedMonth}
            />

            {isLoading && <div className="h-40 animate-pulse rounded-xl bg-gray-200" />}

            {!isLoading && (
                <>
                    <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
                        <span className="text-xs text-muted-foreground">
                            Mensalidades arrecadadas
                        </span>
                        <span className="text-2xl font-bold text-primary-900">
                            {formatCurrency(collected)}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                de {formatCurrency(expected)} esperados
                            </span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Avulsos (partidas): {formatCurrency(oneOffTotal)}
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Mensalidades ({paidCount}/{checklist.length})
                        </h3>
                        {checklist.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhum mensalista no grupo
                            </p>
                        )}
                        {checklist.map(({ member, payment }) => (
                            <div
                                key={member.userId}
                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                            >
                                <Avatar size="sm">
                                    {member.user.profilePicture && (
                                        <AvatarImage src={member.user.profilePicture} />
                                    )}
                                    <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-1 flex-col">
                                    <span className="text-sm font-medium">{member.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {GROUP_MEMBER_TYPE_LABELS[member.type]}
                                    </span>
                                </div>
                                {payment?.receipt && (
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
                                {payment ? (
                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-forest-900">
                                        <CircleCheck className="size-4" />
                                        {formatCurrency(payment.amount)}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-700">
                                        <CircleAlert className="size-4" />
                                        Pendente
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Pagamentos avulsos de {monthName} ({oneOffPayments.length})
                        </h3>
                        {oneOffPayments.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhum pagamento avulso em {monthName}
                            </p>
                        )}
                        {oneOffPayments.map((payment) => (
                            <PaymentRow
                                key={payment.id}
                                title={getMemberName(payment.userId)}
                                subtitle={`${paymentLabel(payment, monthName)} · registrado em ${formatRegisteredAt(payment.createdAt)}`}
                                receipt={payment.receipt}
                                amount={payment.amount}
                            />
                        ))}
                        {isTruncated && (
                            <p className="text-xs text-muted-foreground">
                                Mostrando só os 100 primeiros pagamentos do mês.
                            </p>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
