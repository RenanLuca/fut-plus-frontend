import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/src/app/lib/query-keys";
import { getMe } from "@/src/app/services/usersService";
import { useAuth } from "@/src/app/hooks/useAuth";

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: isAuthenticated,
  });
}
