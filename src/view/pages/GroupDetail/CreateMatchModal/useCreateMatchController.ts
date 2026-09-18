import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { create as createMatchRequest } from "@/src/app/services/groupMatchesService";
import {
  createMatchSchema,
  type CreateMatchFormValues,
} from "./create-match.schema";

const BRAZIL_UTC_OFFSET = "-03:00";

export function useCreateMatchController(groupId: string) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchSchema),
  });

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset();
    }
  }

  const { mutate: createMatch, isPending } = useMutation({
    mutationFn: (values: CreateMatchFormValues) =>
      createMatchRequest(groupId, {
        matchDate: `${values.matchDate}:00${BRAZIL_UTC_OFFSET}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupMatches(groupId),
      });
      setOpen(false);
      toast.success("Partida criada!");
    },
    onError: (mutationError) => {
      if (isAxiosError(mutationError) && mutationError.response?.status === 409) {
        toast.error("Já existe uma partida marcada para essa data nesse grupo");
        return;
      }
      if (isAxiosError(mutationError) && mutationError.response?.status === 400) {
        toast.error("A data da partida não pode ser no passado");
        return;
      }
      toast.error("Não foi possível criar a partida. Tente novamente.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    createMatch(values);
  });

  return {
    open,
    onOpenChange,
    register,
    onSubmit,
    errors,
    isPending,
  };
}
