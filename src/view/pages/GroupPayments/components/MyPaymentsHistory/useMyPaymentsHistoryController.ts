import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findAllMine } from "@/src/app/services/groupPaymentsService";
import {
  getCurrentBrazilMonth,
  type YearMonth,
} from "@/src/app/utils/brazil-month";

export function useMyPaymentsHistoryController(groupId: string) {
  const currentMonth = getCurrentBrazilMonth();
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentMonth);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.myPayments(
      groupId,
      selectedMonth.year,
      selectedMonth.month,
    ),
    queryFn: () => findAllMine(groupId, selectedMonth),
  });

  return {
    currentMonth,
    selectedMonth,
    setSelectedMonth,
    payments: data?.data ?? [],
    isLoading,
  };
}
