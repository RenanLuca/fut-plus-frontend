import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router";
import { queryKeys } from "@/src/app/lib/query-keys";
import { POSITION_ORDER } from "@/src/app/constants/position";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findOne as findMatch } from "@/src/app/services/groupMatchesService";
import { remove as removeMatchGuest } from "@/src/app/services/matchGuestsService";
import { findAll as findMatchTeams } from "@/src/app/services/matchTeamsService";
import type { MatchPresenceMember } from "@/src/app/services/matchPresencesService";
import {
  getTeamPlayerRef,
  useMovePlayerController,
} from "./useMovePlayerController";
import { useMatchPresence } from "@/src/app/hooks/useMatchPresence";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

function sortByPosition(members: MatchPresenceMember[]) {
  return [...members].sort(
    (a, b) => POSITION_ORDER[a.position] - POSITION_ORDER[b.position],
  );
}

export function useMatchDetailController() {
  const { groupId, matchId } = useParams<{
    groupId: string;
    matchId: string;
  }>();
  const { data: currentUser } = useCurrentUser();

  const { data: group } = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: () => findGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: queryKeys.groupMatch(groupId!, matchId!),
    queryFn: () => findMatch(groupId!, matchId!),
    enabled: !!groupId && !!matchId,
  });

  const { presences, isLoadingPresences, myStatus, setPresence, isPending } =
    useMatchPresence(groupId!, matchId!);

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: queryKeys.matchTeams(groupId!, matchId!),
    queryFn: () => findMatchTeams(groupId!, matchId!),
    enabled: !!groupId && !!matchId,
  });

  const isOwner = !!group && !!currentUser && group.ownerId === currentUser.id;

  const teamList = teams ?? [];
  const { movePlayer, isMovingPlayer } = useMovePlayerController(
    groupId!,
    matchId!,
    teamList,
  );
  const assignedPlayerIds = new Set(
    teamList.flatMap((team) =>
      team.matchTeamPlayers.map((player) => getTeamPlayerRef(player).id),
    ),
  );
  const unassignedPlayers =
    teamList.length > 0
      ? (presences?.confirmed ?? []).filter(
          (member) => !assignedPlayerIds.has(member.id),
        )
      : [];
  const confirmedOutfieldCount = (presences?.confirmed ?? []).filter(
    (member) => member.position !== "GOALKEEPER",
  ).length;
  const sortedPresences = presences && {
    confirmed: sortByPosition(presences.confirmed),
    declined: sortByPosition(presences.declined),
    pending: sortByPosition(presences.pending),
  };

  const queryClient = useQueryClient();
  const [guestToRemove, setGuestToRemove] =
    useState<MatchPresenceMember | null>(null);

  const { mutate: confirmRemoveGuest, isPending: isRemovingGuest } =
    useMutation({
      mutationFn: (guestUserId: string) =>
        removeMatchGuest(groupId!, matchId!, guestUserId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.groupMatch(groupId!, matchId!),
        });
        setGuestToRemove(null);
        toast.success("Convidado removido");
      },
      onError: () => {
        toast.error("Não foi possível remover o convidado. Tente novamente.");
      },
    });

  return {
    groupId,
    matchId,
    group,
    match,
    isLoadingMatch,
    presences: sortedPresences,
    isLoadingPresences,
    myStatus,
    setPresence,
    isPending,
    teams: teamList,
    isLoadingTeams,
    isOwner,
    unassignedPlayers,
    confirmedOutfieldCount,
    movePlayer,
    isMovingPlayer,
    guestToRemove,
    setGuestToRemove,
    confirmRemoveGuest,
    isRemovingGuest,
  };
}
