import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findAllPerGroup as findGroupMembers } from "@/src/app/services/groupMembersService";

export function useMyMembership(groupId: string) {
  const { data: currentUser } = useCurrentUser();

  const { data: members, isLoading } = useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: () => findGroupMembers(groupId),
    enabled: !!groupId,
  });

  const membership = members?.find((member) => member.userId === currentUser?.id);

  return { type: membership?.type, isLoading };
}
