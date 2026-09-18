import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/src/app/hooks/useAuth";

export function RequireAuth() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
