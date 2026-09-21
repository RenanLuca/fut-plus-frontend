import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useController, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { TEAM_COLOR_VALUES } from "@/src/app/constants/teamColors";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  update as updateMatchTeam,
  type MatchTeam,
} from "@/src/app/services/matchTeamsService";
import { editTeamSchema, type EditTeamFormValues } from "./edit-team.schema";

export function useEditTeamController(
  groupId: string,
  matchId: string,
  team: MatchTeam,
  onSaved: () => void,
) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditTeamFormValues>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: team.name,
      color: TEAM_COLOR_VALUES.find(
        (color) => color.toLowerCase() === team.color.toLowerCase(),
      ),
    },
  });

  const { field: colorField } = useController({ name: "color", control });

  const { mutate: saveTeam, isPending } = useMutation({
    mutationFn: (values: EditTeamFormValues) =>
      updateMatchTeam(groupId, matchId, team.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchTeams(groupId, matchId),
      });
      onSaved();
      toast.success("Time atualizado");
    },
    onError: () => {
      toast.error("Não foi possível atualizar o time. Tente novamente.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    saveTeam(values);
  });

  return { register, colorField, onSubmit, errors, isPending };
}
