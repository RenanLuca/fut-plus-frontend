import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";

export function useGroupPaymentsController() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: currentUser } = useCurrentUser();

  const { data: group } = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: () => findGroup(groupId!),
    enabled: !!groupId,
  });

  const isOwner = !!group && !!currentUser && group.ownerId === currentUser.id;

  return { groupId: groupId!, isOwner };
}
