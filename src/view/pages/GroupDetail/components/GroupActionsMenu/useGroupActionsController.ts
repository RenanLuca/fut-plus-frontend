import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { remove as removeGroup } from "@/src/app/services/groupsService";
import { leave as leaveGroupRequest } from "@/src/app/services/groupMembersService";

export function useGroupActionsController(groupId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function afterLosingAccessToGroup() {
    navigate("/groups");
    queryClient.removeQueries({ queryKey: queryKeys.group(groupId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.groups });
    queryClient.invalidateQueries({ queryKey: queryKeys.upcomingMatch });
  }

  const { mutate: deleteGroup, isPending: isDeleting } = useMutation({
    mutationFn: () => removeGroup(groupId),
    onSuccess: () => {
      afterLosingAccessToGroup();
      toast.success("Grupo apagado");
    },
    onError: () => {
      toast.error("Não foi possível apagar o grupo. Tente novamente.");
    },
  });

  const { mutate: leaveGroup, isPending: isLeaving } = useMutation({
    mutationFn: () => leaveGroupRequest(groupId),
    onSuccess: () => {
      afterLosingAccessToGroup();
      toast.success("Você saiu do grupo");
    },
    onError: () => {
      toast.error("Não foi possível sair do grupo. Tente novamente.");
    },
  });

  return { deleteGroup, isDeleting, leaveGroup, isLeaving };
}
