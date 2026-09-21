import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findAllPerGroup as findGroupMembers } from "@/src/app/services/groupMembersService";
import { findAllByGroup } from "@/src/app/services/groupPaymentsService";
import {
  getCurrentBrazilMonth,
  type YearMonth,
} from "@/src/app/utils/brazil-month";

const sumAmounts = (payments: { amount: number }[]) =>
  payments.reduce((total, payment) => total + payment.amount, 0);

export function useGroupOverviewController(groupId: string) {
  const currentMonth = getCurrentBrazilMonth();
  const [selectedMonth, setSelectedMonth] = useState<YearMonth>(currentMonth);

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => findGroup(groupId),
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: () => findGroupMembers(groupId),
  });

  const { data: paymentsPage, isLoading: isLoadingPayments } = useQuery({
    queryKey: queryKeys.groupPaymentsByMonth(
      groupId,
      selectedMonth.year,
      selectedMonth.month,
    ),
    queryFn: () => findAllByGroup(groupId, selectedMonth),
  });

  const payments = paymentsPage?.data ?? [];
  const monthlyPayments = payments.filter((payment) => payment.matchId === null);
  const oneOffPayments = payments.filter((payment) => payment.matchId !== null);

  const monthlyFeePayers = (members ?? []).filter(
    (member) => member.type === "MONTHLY" || member.type === "OWNER",
  );
  const monthlyPaymentByUser = new Map(
    monthlyPayments.map((payment) => [payment.userId, payment]),
  );
  const checklist = monthlyFeePayers.map((member) => ({
    member,
    payment: monthlyPaymentByUser.get(member.userId),
  }));

  const memberNames = new Map(
    (members ?? []).map((member) => [member.userId, member.user.name]),
  );

  return {
    currentMonth,
    selectedMonth,
    setSelectedMonth,
    isLoading: isLoadingGroup || isLoadingMembers || isLoadingPayments,
    checklist,
    paidCount: checklist.filter((item) => item.payment).length,
    collected: sumAmounts(monthlyPayments),
    expected: monthlyFeePayers.length * (group?.valuePerUser ?? 0),
    oneOffTotal: sumAmounts(oneOffPayments),
    payments,
    isTruncated: (paymentsPage?.meta.total ?? 0) > payments.length,
    getMemberName: (userId: string) => memberNames.get(userId) ?? "Ex-membro",
  };
}
