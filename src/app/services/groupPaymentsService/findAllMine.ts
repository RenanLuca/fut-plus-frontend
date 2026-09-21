import { httpClient } from "@/src/app/lib/http-client";

export type GroupPayment = {
  id: string;
  groupId: string;
  userId: string;
  matchId: string | null;
  period: string;
  amount: number;
  receipt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedPayments = {
  data: GroupPayment[];
  meta: PaginationMeta;
};

export type PaymentsFilter = {
  year: number;
  month: number;
};

const MAX_PAGE_SIZE = 100;

export async function findAllMine(
  groupId: string,
  { year, month }: PaymentsFilter,
): Promise<PaginatedPayments> {
  const { data } = await httpClient.get<PaginatedPayments>(
    `/groups/${groupId}/group-payments/me`,
    { params: { year, month, limit: MAX_PAGE_SIZE } },
  );
  return data;
}
