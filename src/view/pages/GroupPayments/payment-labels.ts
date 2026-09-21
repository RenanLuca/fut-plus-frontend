import type { GroupPayment } from "@/src/app/services/groupPaymentsService";

const paidAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

const matchDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

export function formatRegisteredAt(createdAt: string) {
  return paidAtFormatter.format(new Date(createdAt));
}

export function paymentLabel(payment: GroupPayment, monthName: string) {
  return payment.matchId
    ? `Partida de ${matchDateFormatter.format(new Date(payment.period))}`
    : `Mensalidade de ${monthName}`;
}
