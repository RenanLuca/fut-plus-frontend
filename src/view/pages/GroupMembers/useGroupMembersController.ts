import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import { findAllPerGroup as findGroupMembers } from "@/src/app/services/groupMembersService";

export function useGroupMembersController() {
  const { groupId } = useParams<{ groupId: string }>();

  const { data: group } = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: () => findGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: members, isLoading } = useQuery({
    queryKey: queryKeys.groupMembers(groupId!),
    queryFn: () => findGroupMembers(groupId!),
    enabled: !!groupId,
  });

  return {
    groupId,
    group,
    members: members ?? [],
    isLoading,
  };
}
