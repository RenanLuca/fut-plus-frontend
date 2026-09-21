import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findOne as findGroup } from "@/src/app/services/groupsService";
import {
  findAllPerGroup as findGroupMembers,
  removeUser,
  type GroupMember,
} from "@/src/app/services/groupMembersService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

export function useGroupMembersController() {
  const { groupId } = useParams<{ groupId: string }>();
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(
    null,
  );

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

  const isOwner = !!group && !!currentUser && group.ownerId === currentUser.id;

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: (userId: string) => removeUser(groupId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupMembers(groupId!),
      });
      setMemberToRemove(null);
      toast.success("Membro removido");
    },
    onError: () => {
      toast.error("Não foi possível remover o membro. Tente novamente.");
    },
  });

  function confirmRemoval() {
    if (memberToRemove?.userId) {
      removeMember(memberToRemove.userId);
    }
  }

  return {
    groupId,
    group,
    members: members ?? [],
    isLoading,
    isOwner,
    memberToRemove,
    setMemberToRemove,
    confirmRemoval,
    isRemoving,
  };
}
