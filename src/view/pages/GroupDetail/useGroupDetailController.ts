import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findAll as findGroupMatches } from "@/src/app/services/groupMatchesService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";
import { getNextMatch } from "@/src/app/utils/get-next-match";

export function useGroupDetailController() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: currentUser } = useCurrentUser();

  const { data: group } = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: () => findGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: matches, isLoading: isLoadingMatches } = useQuery({
    queryKey: queryKeys.groupMatches(groupId!),
    queryFn: () => findGroupMatches(groupId!),
    enabled: !!groupId,
  });

  const isOwner = !!group && !!currentUser && group.ownerId === currentUser.id;

  return {
    group,
    nextMatch: matches ? getNextMatch(matches) : undefined,
    isLoadingMatches,
    isOwner,
  };
}
