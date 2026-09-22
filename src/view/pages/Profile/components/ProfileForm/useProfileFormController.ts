import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useController, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  update as updateUser,
  type CurrentUser,
} from "@/src/app/services/usersService";
import { profileSchema, type ProfileFormValues } from "../../profile.schema";

function toFormValues(user: CurrentUser): ProfileFormValues {
  return {
    name: user.name,
    position: user.position,
    telefone: user.telefone ?? "",
    profilePicture: user.profilePicture ?? "",
  };
}

export function useProfileFormController(user: CurrentUser) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
  });

  const { field: positionField } = useController({ name: "position", control });
  const { field: phoneField } = useController({ name: "telefone", control });

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: (values: ProfileFormValues) => updateUser(values),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.me, updatedUser);
      reset(toFormValues(updatedUser));
      toast.success("Perfil atualizado");
    },
    onError: () => {
      toast.error("Não foi possível atualizar o perfil. Tente novamente.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    saveProfile(values);
  });

  return {
    register,
    positionField,
    phoneField,
    onSubmit,
    errors,
    canSave: isDirty && !isPending,
    isPending,
  };
}
