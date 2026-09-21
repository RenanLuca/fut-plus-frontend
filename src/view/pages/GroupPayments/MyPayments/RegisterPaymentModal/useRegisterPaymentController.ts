import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import {
  create as createPayment,
  findPendingMatches,
} from "@/src/app/services/groupPaymentsService";
import {
  buildRegisterPaymentSchema,
  type RegisterPaymentFormValues,
} from "./register-payment.schema";

const matchLabelFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function useRegisterPaymentController(
  groupId: string,
  isDaily: boolean,
  onRegistered: () => void,
) {
  const queryClient = useQueryClient();
  const [valuesToConfirm, setValuesToConfirm] =
    useState<RegisterPaymentFormValues | null>(null);

  const { data: group } = useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => findGroup(groupId),
  });

  const { data: pendingMatches } = useQuery({
    queryKey: queryKeys.pendingPaymentMatches(groupId),
    queryFn: () => findPendingMatches(groupId),
    enabled: isDaily,
  });

  const matchOptions = (pendingMatches ?? []).map((match) => ({
    value: match.id,
    label: matchLabelFormatter.format(new Date(match.matchDate)),
  }));

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterPaymentFormValues>({
    resolver: zodResolver(buildRegisterPaymentSchema(isDaily)),
    defaultValues: {
      amount: group ? String(group.valuePerUser) : "",
      receipt: "",
    },
  });

  const { field: amountField } = useController({ name: "amount", control });
  const { field: matchField } = useController({ name: "matchId", control });

  const { mutate: registerPayment, isPending } = useMutation({
    mutationFn: (values: RegisterPaymentFormValues) =>
      createPayment(groupId, {
        amount: Number(values.amount),
        receipt: values.receipt || undefined,
        matchId: isDaily ? values.matchId : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupPayments(groupId),
      });
      onRegistered();
      toast.success("Pagamento registrado");
    },
    onError: () => {
      setValuesToConfirm(null);
      toast.error("Não foi possível registrar o pagamento. Tente novamente.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    setValuesToConfirm(values);
  });

  function confirmRegistration() {
    if (valuesToConfirm) {
      registerPayment(valuesToConfirm);
    }
  }

  return {
    register,
    amountField,
    matchField,
    matchOptions,
    onSubmit,
    errors,
    valuesToConfirm,
    cancelConfirmation: () => setValuesToConfirm(null),
    confirmRegistration,
    isPending,
  };
}
