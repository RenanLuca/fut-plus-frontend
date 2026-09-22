import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findAllPerGroup as findGroupMembers } from "@/src/app/services/groupMembersService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

export function useGroupLayoutController() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: currentUser } = useCurrentUser();

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: () => findGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: members } = useQuery({
    queryKey: queryKeys.groupMembers(groupId!),
    queryFn: () => findGroupMembers(groupId!),
    enabled: !!groupId,
  });

  const isOwner = !!group && !!currentUser && group.ownerId === currentUser.id;

  return {
    group,
    isLoadingGroup,
    membersCount: members?.length,
    isOwner,
  };
}
