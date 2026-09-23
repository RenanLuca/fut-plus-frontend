import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  update as updateUser,
  type CurrentUser,
} from "@/src/app/services/usersService";

export function useNotificationsController(user: CurrentUser) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (emailNotifications: boolean) =>
      updateUser({ emailNotifications }),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.me, updatedUser);
    },
    onError: () => {
      toast.error("Não foi possível atualizar a preferência. Tente novamente.");
    },
  });

  function onToggle() {
    mutate(!user.emailNotifications);
  }

  return {
    enabled: user.emailNotifications,
    onToggle,
    isPending,
  };
}
