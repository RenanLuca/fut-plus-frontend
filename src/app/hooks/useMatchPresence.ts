import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  findAll as findPresences,
  update as updatePresence,
} from "@/src/app/services/matchPresencesService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

export type MyPresenceStatus = "confirmed" | "declined" | "pending";

export function useMatchPresence(groupId: string, matchId: string) {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: presences, isLoading: isLoadingPresences } = useQuery({
    queryKey: queryKeys.matchPresences(groupId, matchId),
    queryFn: () => findPresences(groupId, matchId),
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
      updatePresence(groupId, matchId, { isPresent }),
    onSuccess: (_data, isPresent) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchPresences(groupId, matchId),
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
