import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  create as createGroupRequest,
  update as updateGroupRequest,
  type Group,
} from "@/src/app/services/groupsService";
import { groupFormSchema, type GroupFormValues } from "./group-form.schema";

export type GroupFormModalProps =
  | { mode: "create" }
  | { mode: "edit"; group: Group };

export function useGroupFormController(props: GroupFormModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
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

  function onOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;

    if (props.mode === "edit") {
      reset({
        name: props.group.name,
        weekday: props.group.weekday,
        hour: props.group.hour,
        frequency: props.group.frequency,
        valuePerUser: String(props.group.valuePerUser),
      });
    } else {
      reset();
    }
  }

  const { mutate: saveGroup, isPending } = useMutation({
    mutationFn: (values: GroupFormValues) => {
      const payload = {
        ...values,
        valuePerUser: Number(values.valuePerUser),
      };
      return props.mode === "edit"
        ? updateGroupRequest(props.group.id, payload)
        : createGroupRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      if (props.mode === "edit") {
        queryClient.invalidateQueries({
          queryKey: queryKeys.group(props.group.id),
        });
      }
      setOpen(false);
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
    open,
    onOpenChange,
    register,
    weekdayField,
    frequencyField,
    valuePerUserField,
    onSubmit,
    errors,
    isPending,
  };
}
