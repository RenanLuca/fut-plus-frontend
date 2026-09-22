import { useQuery } from "@tanstack/react-query";
import { useMyMembership } from "@/src/app/hooks/useMyMembership";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  findAllMine,
  findPendingMatches,
} from "@/src/app/services/groupPaymentsService";
import { getCurrentBrazilMonth } from "@/src/app/utils/brazil-month";

export function useMyPaymentStatusController(groupId: string) {
  const { type, isLoading: isLoadingMembership } = useMyMembership(groupId);
  const currentMonth = getCurrentBrazilMonth();
  const isDaily = type === "DAILY";

  const { data: currentMonthPayments, isLoading: isLoadingCurrentMonth } =
    useQuery({
      queryKey: queryKeys.myPayments(
        groupId,
        currentMonth.year,
        currentMonth.month,
      ),
      queryFn: () => findAllMine(groupId, currentMonth),
      enabled: !!type && !isDaily,
    });

  const { data: pendingMatches, isLoading: isLoadingPendingMatches } = useQuery({
    queryKey: queryKeys.pendingPaymentMatches(groupId),
    queryFn: () => findPendingMatches(groupId),
    enabled: isDaily,
  });

  const monthlyFeePayment = currentMonthPayments?.data.find(
    (payment) => payment.matchId === null,
  );

  const isLoading =
    isLoadingMembership ||
    (isDaily ? isLoadingPendingMatches : isLoadingCurrentMonth);
  const pendingMatchesCount = pendingMatches?.length ?? 0;
  const canRegister =
    !isLoading &&
    !!type &&
    (isDaily ? pendingMatchesCount > 0 : !monthlyFeePayment);

  return {
    isDaily,
    canRegister,
    currentMonth,
    monthlyFeePayment,
    pendingMatchesCount,
    isLoading,
  };
}
