import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useController, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  create as createGroupRequest,
  update as updateGroupRequest,
  type Group,
} from "@/src/app/services/groupsService";
import {
  createGroupFormSchema,
  groupFormSchema,
  type GroupFormValues,
} from "./group-form.schema";

export type GroupFormMode =
  | { mode: "create" }
  | { mode: "edit"; group: Group };

export function useGroupFormController(
  props: GroupFormMode,
  onSaved: () => void,
) {
  const queryClient = useQueryClient();
  const isCreate = props.mode === "create";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(isCreate ? createGroupFormSchema : groupFormSchema),
    defaultValues:
      props.mode === "edit"
        ? {
            name: props.group.name,
            weekday: props.group.weekday,
            hour: props.group.hour,
            frequency: props.group.frequency,
            valuePerUser: String(props.group.valuePerUser),
          }
        : undefined,
  });

  const { field: weekdayField } = useController({ name: "weekday", control });
  const { field: frequencyField } = useController({
    name: "frequency",
    control,
  });
  const { field: valuePerUserField } = useController({
    name: "valuePerUser",
    control,
  });
  const { field: rankField } = useController({ name: "rank", control });

  const { mutate: saveGroup, isPending } = useMutation({
    mutationFn: (values: GroupFormValues) => {
      const valuePerUser = Number(values.valuePerUser);
      if (props.mode === "edit") {
        return updateGroupRequest(props.group.id, {
          name: values.name,
          weekday: values.weekday,
          hour: values.hour,
          frequency: values.frequency,
          valuePerUser,
        });
      }
      return createGroupRequest({
        name: values.name,
        weekday: values.weekday,
        hour: values.hour,
        frequency: values.frequency,
        valuePerUser,
        rank: values.rank!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      if (props.mode === "edit") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.group(props.group.id),
        });
      }
      onSaved();
      toast.success(
        props.mode === "edit" ? "Grupo atualizado!" : "Grupo criado!",
      );
    },
    onError: () => {
      toast.error(
        props.mode === "edit"
          ? "Não foi possível atualizar o grupo. Tente novamente."
          : "Não foi possível criar o grupo. Tente novamente.",
      );
    },
  });

  const onSubmit = handleSubmit((values) => {
    saveGroup(values);
  });

  return {
    register,
    weekdayField,
    frequencyField,
    valuePerUserField,
    rankField,
    isCreate,
    onSubmit,
    errors,
    isPending,
  };
}
