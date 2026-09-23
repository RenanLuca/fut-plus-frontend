import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { generate as generateTeamsRequest } from "@/src/app/services/matchTeamsService";
import {
  generateTeamsSchema,
  type GenerateTeamsFormValues,
} from "./generate-teams.schema";

export function useGenerateTeamsController(
  groupId: string,
  matchId: string,
  confirmedCount: number,
) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GenerateTeamsFormValues>({
    resolver: zodResolver(generateTeamsSchema),
    defaultValues: { playersPerTeam: "5" },
  });

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      reset({ playersPerTeam: "5" });
    }
  }

  const playersPerTeamValue = useWatch({ control, name: "playersPerTeam" });
  const playersPerTeam = Number(playersPerTeamValue);
  const estimatedTeamCount =
    playersPerTeam > 0 ? Math.floor(confirmedCount / playersPerTeam) : 0;
  // Precisam caber pelo menos 2 times, então o teto é metade dos confirmados.
  const maxPlayersPerTeam = Math.floor(confirmedCount / 2);
  const isImpossible = playersPerTeam > 0 && playersPerTeam > maxPlayersPerTeam;
  const impossibleMessage =
    maxPlayersPerTeam < 1
      ? "Confirmados insuficientes para formar 2 times"
      : `Com ${confirmedCount} confirmados, o máximo é ${maxPlayersPerTeam} jogadores por time`;

  const { mutate: generateTeams, isPending } = useMutation({
    mutationFn: (values: GenerateTeamsFormValues) =>
      generateTeamsRequest(groupId, matchId, {
        playersPerTeam: Number(values.playersPerTeam),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchTeams(groupId, matchId),
      });
      setOpen(false);
      toast.success("Times gerados!");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 400) {
        toast.error("Poucos jogadores confirmados pra esse tamanho de time.");
        return;
      }
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
    estimatedTeamCount,
    isImpossible,
    impossibleMessage,
  };
}
