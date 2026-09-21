import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useController, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "@/src/app/hooks/useAuth";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  accept as acceptInvite,
  preview as findInvitePreview,
} from "@/src/app/services/invitesService";
import { inviteSchema, type InviteFormValues } from "./invite.schema";

export function useInviteController() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: invite,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.invite(inviteId!),
    queryFn: () => findInvitePreview(inviteId!),
    enabled: isAuthenticated && !!inviteId,
    retry: false,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const { field: typeField } = useController({ name: "type", control });
  const { field: rankField } = useController({ name: "rank", control });

  const { mutate: join, isPending } = useMutation({
    mutationFn: (values: InviteFormValues) => acceptInvite(inviteId!, values),
    onSuccess: ({ groupId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      queryClient.invalidateQueries({ queryKey: queryKeys.upcomingMatch });
      toast.success("Você entrou no grupo");
      navigate(`/groups/${groupId}`, { replace: true });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.invite(inviteId!),
        });
        toast.error("Você já faz parte deste grupo.");
        return;
      }
      toast.error("Não foi possível entrar no grupo. Tente novamente.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    join(values);
  });

  return {
    isAuthenticated,
    loginRedirect: `/?redirect=${encodeURIComponent(pathname)}`,
    invite,
    isLoading,
    isError,
    typeField,
    rankField,
    onSubmit,
    errors,
    isPending,
  };
}
