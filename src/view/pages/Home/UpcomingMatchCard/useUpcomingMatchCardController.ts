import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  findAll as findPresences,
  update as updatePresence,
} from "@/src/app/services/matchPresencesService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";
import type { UpcomingMatch } from "@/src/app/services/usersService";

export type MyPresenceStatus = "confirmed" | "declined" | "pending";

export function useUpcomingMatchCardController(match: UpcomingMatch) {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: presences, isLoading: isLoadingPresences } = useQuery({
    queryKey: queryKeys.matchPresences(match.groupId, match.id),
    queryFn: () => findPresences(match.groupId, match.id),
  });

  let myStatus: MyPresenceStatus = "pending";
  if (presences && currentUser) {
    if (presences.confirmed.some((member) => member.id === currentUser.id)) {
      myStatus = "confirmed";
    } else if (
      presences.declined.some((member) => member.id === currentUser.id)
    ) {
      myStatus = "declined";
    }
  }

  const { mutate: setPresence, isPending } = useMutation({
    mutationFn: (isPresent: boolean) =>
      updatePresence(match.groupId, match.id, { isPresent }),
    onSuccess: (_data, isPresent) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchPresences(match.groupId, match.id),
      });
      toast.success(isPresent ? "Presença confirmada!" : "Presença recusada");
    },
    onError: () => {
      toast.error(
        "Não foi possível atualizar sua presença. Tente novamente.",
      );
    },
  });

  return {
    presences,
    isLoadingPresences,
    myStatus,
    setPresence,
    isPending,
  };
}
