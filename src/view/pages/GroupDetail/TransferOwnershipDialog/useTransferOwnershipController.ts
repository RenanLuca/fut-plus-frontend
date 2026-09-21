import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  transferOwnership,
  type Group,
} from "@/src/app/services/groupsService";
import { findAllPerGroup as findGroupMembers } from "@/src/app/services/groupMembersService";

export function useTransferOwnershipController(
  group: Group,
  onTransferred: () => void,
) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: members } = useQuery({
    queryKey: queryKeys.groupMembers(group.id),
    queryFn: () => findGroupMembers(group.id),
  });

  const candidates = (members ?? [])
    .filter((member) => member.userId && member.userId !== group.ownerId)
    .map((member) => ({
      value: member.userId as string,
      label: member.user?.name ?? "—",
    }));

  const { mutate: transfer, isPending } = useMutation({
    mutationFn: (newOwnerId: string) =>
      transferOwnership(group.id, { newOwnerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      onTransferred();
      toast.success("Posse transferida");
    },
    onError: () => {
      toast.error("Não foi possível transferir a posse. Tente novamente.");
    },
  });

  function confirmTransfer() {
    if (selectedUserId) {
      transfer(selectedUserId);
    }
  }

  return {
    candidates,
    selectedUserId,
    setSelectedUserId,
    confirmTransfer,
    isPending,
  };
}
