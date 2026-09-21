import { httpClient } from "@/src/app/lib/http-client";
import type { PaginatedPayments, PaymentsFilter } from "./findAllMine";

const MAX_PAGE_SIZE = 100;

export async function findAllByGroup(
  groupId: string,
  { year, month }: PaymentsFilter,
): Promise<PaginatedPayments> {
  const { data } = await httpClient.get<PaginatedPayments>(
    `/groups/${groupId}/group-payments`,
    { params: { year, month, limit: MAX_PAGE_SIZE } },
  );
  return data;
}
