import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";
import { queryKeys } from "@/src/app/lib/query-keys";
import { create as createGroupRequest } from "@/src/app/services/groupsService";
import {
  createGroupSchema,
  type CreateGroupFormValues,
} from "./create-group.schema";

export function useCreateGroupController() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateGroupFormValues>({
    resolver: zodResolver(createGroupSchema),
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

  const { mutate: createGroup, isPending } = useMutation({
    mutationFn: createGroupRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      reset();
      setOpen(false);
    },
  });

  const onSubmit = handleSubmit((values) => {
    createGroup({ ...values, valuePerUser: Number(values.valuePerUser) });
  });

  return {
    open,
    setOpen,
    register,
    weekdayField,
    frequencyField,
    valuePerUserField,
    onSubmit,
    errors,
    isPending,
  };
}
