import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useController, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import { create as createMatchGuest } from "@/src/app/services/matchGuestsService";
import { addGuestSchema, type AddGuestFormValues } from "./add-guest.schema";

export function useAddGuestController(
  groupId: string,
  matchId: string,
  onAdded: () => void,
) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddGuestFormValues>({
    resolver: zodResolver(addGuestSchema),
  });

  const { field: positionField } = useController({
    name: "position",
    control,
  });
  const { field: rankField } = useController({ name: "rank", control });

  const { mutate: addGuest, isPending } = useMutation({
    mutationFn: (values: AddGuestFormValues) =>
      createMatchGuest(groupId, matchId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.groupMatch(groupId, matchId),
      });
      onAdded();
      toast.success("Convidado adicionado");
    },
    onError: () => {
      toast.error("Não foi possível adicionar o convidado. Tente novamente.");
    },
  });

  const onSubmit = handleSubmit((values) => {
    addGuest(values);
  });

  return {
    register,
    positionField,
    rankField,
    onSubmit,
    errors,
    isPending,
  };
}
