import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { remove as removeMatch } from "@/src/app/services/groupMatchesService";

export function useMatchActionsController(groupId: string, matchId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deleteMatch, isPending: isDeleting } = useMutation({
    mutationFn: () => removeMatch(groupId, matchId),
    onSuccess: () => {
      navigate(`/groups/${groupId}`);
      queryClient.removeQueries({
        queryKey: queryKeys.groupMatch(groupId, matchId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupMatches(groupId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.upcomingMatch });
      toast.success("Partida apagada");
    },
    onError: () => {
      toast.error("Não foi possível apagar a partida. Tente novamente.");
    },
  });

  return { deleteMatch, isDeleting };
}
