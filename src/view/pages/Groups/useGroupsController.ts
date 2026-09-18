import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findAll as findAllGroups } from "@/src/app/services/groupsService";

export function useGroupsController() {
  const { data: groups, isLoading } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: findAllGroups,
  });

  return {
    groups: groups ?? [],
    isLoading,
  };
}
