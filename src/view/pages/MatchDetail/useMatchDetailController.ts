import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findOne as findMatch } from "@/src/app/services/groupMatchesService";
import { findAll as findMatchTeams } from "@/src/app/services/matchTeamsService";
import { useMatchPresence } from "@/src/app/hooks/useMatchPresence";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

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

  return {
    groupId,
    matchId,
    group,
    match,
    isLoadingMatch,
    presences,
    isLoadingPresences,
    myStatus,
    setPresence,
    isPending,
    teams: teams ?? [],
    isLoadingTeams,
    isOwner,
  };
}
