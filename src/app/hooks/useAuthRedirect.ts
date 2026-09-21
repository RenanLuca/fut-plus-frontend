import { useSearchParams } from "react-router";

const DEFAULT_REDIRECT = "/home";

function isSafeInternalPath(path: string | null): path is string {
  return (
    !!path &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\")
  );
}

export function useAuthRedirect() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const safeRedirect = isSafeInternalPath(redirect) ? redirect : null;

  function withRedirect(path: string) {
    return safeRedirect
      ? `${path}?redirect=${encodeURIComponent(safeRedirect)}`
      : path;
  }

  return { redirectTo: safeRedirect ?? DEFAULT_REDIRECT, withRedirect };
}
