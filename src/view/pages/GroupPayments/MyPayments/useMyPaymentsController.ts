import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useMyMembership } from "@/src/app/hooks/useMyMembership";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  findAllMine,
  findPendingMatches,
} from "@/src/app/services/groupPaymentsService";
import {
  getCurrentBrazilMonth,
  type YearMonth,
} from "@/src/app/utils/brazil-month";

export function useMyPaymentsController(groupId: string) {
  const { type, isLoading: isLoadingMembership } = useMyMembership(groupId);
  const currentMonth = getCurrentBrazilMonth();
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentMonth);

  const { data: currentMonthPayments, isLoading: isLoadingCurrentMonth } =
    useQuery({
      queryKey: queryKeys.myPayments(
        groupId,
        currentMonth.year,
        currentMonth.month,
      ),
      queryFn: () => findAllMine(groupId, currentMonth),
    });

  const { data: selectedMonthPayments, isLoading: isLoadingSelectedMonth } =
    useQuery({
      queryKey: queryKeys.myPayments(
        groupId,
        selectedMonth.year,
        selectedMonth.month,
      ),
      queryFn: () => findAllMine(groupId, selectedMonth),
    });

  const isDaily = type === "DAILY";

  const { data: pendingMatches, isLoading: isLoadingPendingMatches } = useQuery({
    queryKey: queryKeys.pendingPaymentMatches(groupId),
    queryFn: () => findPendingMatches(groupId),
    enabled: isDaily,
  });

  const monthlyFeePayment = currentMonthPayments?.data.find(
    (payment) => payment.matchId === null,
  );

  return {
    isDaily,
    currentMonth,
    selectedMonth,
    setSelectedMonth,
    monthlyFeePayment,
    pendingMatchesCount: pendingMatches?.length ?? 0,
    isLoadingStatus:
      isLoadingMembership ||
      (isDaily ? isLoadingPendingMatches : isLoadingCurrentMonth),
    payments: selectedMonthPayments?.data ?? [],
    isLoadingPayments: isLoadingSelectedMonth,
  };
}
