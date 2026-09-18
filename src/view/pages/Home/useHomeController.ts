import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/app/lib/query-keys";
import { findAll as findAllGroups } from "@/src/app/services/groupsService";
import { findUpcomingMatch } from "@/src/app/services/usersService";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

export function useHomeController() {
  const { data: user } = useCurrentUser();

  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: findAllGroups,
  });

  const { data: upcomingMatch, isLoading: isLoadingUpcomingMatch } = useQuery(
    {
      queryKey: queryKeys.upcomingMatch,
      queryFn: findUpcomingMatch,
    },
  );

  return {
    user,
    groups: groups ?? [],
    isLoadingGroups,
    upcomingMatch,
    isLoadingUpcomingMatch,
  };
}
