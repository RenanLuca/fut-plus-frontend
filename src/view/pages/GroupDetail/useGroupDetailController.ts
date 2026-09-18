import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findAllPerGroup as findGroupMembers } from "@/src/app/services/groupMembersService";
import { findAll as findGroupMatches } from "@/src/app/services/groupMatchesService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

export function useGroupDetailController() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: currentUser } = useCurrentUser();

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: () => findGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: queryKeys.groupMembers(groupId!),
    queryFn: () => findGroupMembers(groupId!),
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
    isLoadingGroup,
    members: members ?? [],
    isLoadingMembers,
    matches: matches ?? [],
    isLoadingMatches,
    isOwner,
  };
}
