import { createContext, useState, type ReactNode } from "react";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";

export type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    authTokenStorage.get(),
  );

  function login(newToken: string) {
    authTokenStorage.set(newToken);
    setToken(newToken);
  }

  function logout() {
    authTokenStorage.clear();
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
