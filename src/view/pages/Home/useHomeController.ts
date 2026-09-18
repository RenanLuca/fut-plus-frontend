import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findAll as findAllGroups } from "@/src/app/services/groupsService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

export function useHomeController() {
  const { data: user } = useCurrentUser();

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: findAllGroups,
  });

  return {
    user,
    groups: groups ?? [],
    isLoadingGroups,
  };
}
