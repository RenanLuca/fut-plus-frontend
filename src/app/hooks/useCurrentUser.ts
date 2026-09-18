import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/src/app/services/authService";
import { useAuth } from "@/src/app/hooks/useAuth";

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuthenticated,
  });
}
