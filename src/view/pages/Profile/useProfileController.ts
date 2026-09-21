import { useAuth } from "@/src/app/hooks/useAuth";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";

export function useProfileController() {
  const { data: user, isLoading } = useCurrentUser();
  const { logout } = useAuth();

  return { user, isLoading, logout };
}
