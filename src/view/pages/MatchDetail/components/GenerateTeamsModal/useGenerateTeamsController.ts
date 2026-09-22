import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { generate as generateTeamsRequest } from "@/src/app/services/matchTeamsService";
import {
  generateTeamsSchema,
  type GenerateTeamsFormValues,
} from "./generate-teams.schema";

export function useGenerateTeamsController(groupId: string, matchId: string) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenerateTeamsFormValues>({
    resolver: zodResolver(generateTeamsSchema),
    defaultValues: { teamCount: "2" },
  });

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset({ teamCount: "2" });
    }
  }

  const { mutate: generateTeams, isPending } = useMutation({
    mutationFn: (values: GenerateTeamsFormValues) =>
      generateTeamsRequest(groupId, matchId, {
        teamCount: Number(values.teamCount),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchTeams(groupId, matchId),
      });
      setOpen(false);
      toast.success("Times gerados!");
    },
    onError: () => {
      toast.error("Não foi possível gerar os times. Tente novamente.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    generateTeams(values);
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
