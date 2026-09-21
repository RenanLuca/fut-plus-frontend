import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  findByGroup as findGroupInvite,
  regenerate as regenerateInvite,
  revoke as revokeInvite,
} from "@/src/app/services/invitesService";
import { buildInviteLink } from "@/src/app/utils/build-invite-link";

export function useInviteLinkController(groupId: string) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<"regenerate" | "revoke" | null>(
    null,
  );

  const { data: invite, isLoading } = useQuery({
    queryKey: queryKeys.groupInvite(groupId),
    queryFn: () => findGroupInvite(groupId),
  });

  const { mutate: regenerate, isPending: isRegenerating } = useMutation({
    mutationFn: () => regenerateInvite(groupId),
    onSuccess: (newInvite) => {
      queryClient.setQueryData(queryKeys.groupInvite(groupId), newInvite);
      setConfirming(null);
      toast.success("Link gerado");
    },
    onError: () => {
      toast.error("Não foi possível gerar o link. Tente novamente.");
    },
  });

  const { mutate: revoke, isPending: isRevoking } = useMutation({
    mutationFn: () => revokeInvite(groupId),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.groupInvite(groupId), null);
      setConfirming(null);
      toast.success("Link revogado");
    },
    onError: () => {
      toast.error("Não foi possível revogar o link. Tente novamente.");
    },
  });

  const link = invite ? buildInviteLink(invite.id) : null;

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  }

  return {
    link,
    isLoading,
    copyLink,
    regenerate: () => regenerate(),
    isRegenerating,
    revoke: () => revoke(),
    isRevoking,
    confirming,
    setConfirming,
  };
}
