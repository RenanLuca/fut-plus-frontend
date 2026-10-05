import type {
  GroupPayment,
  PaginatedPayments,
} from "@/src/app/services/groupPaymentsService";

export function makePaymentMock(
  overrides: Partial<GroupPayment> = {},
): GroupPayment {
  return {
    id: "payment-1",
    groupId: "group-1",
    userId: "user-logado",
    matchId: null,
    period: "2026-10-01T00:00:00.000Z",
    amount: 20,
    receipt: null,
    createdAt: "2026-10-05T15:00:00.000Z",
    updatedAt: "2026-10-05T15:00:00.000Z",
    ...overrides,
  };
}

export function makePaginatedPayments(
  payments: GroupPayment[],
  total = payments.length,
): PaginatedPayments {
  return {
    data: payments,
    meta: { page: 1, limit: 100, total, totalPages: 1 },
  };
}
