import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findOne as findMatch } from "@/src/app/services/groupMatchesService";
import { useMatchPresence } from "@/src/app/hooks/useMatchPresence";

export function useMatchDetailController() {
  const { groupId, matchId } = useParams<{
    groupId: string;
    matchId: string;
  }>();

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

  return {
    group,
    match,
    isLoadingMatch,
    presences,
    isLoadingPresences,
    myStatus,
    setPresence,
    isPending,
  };
}
