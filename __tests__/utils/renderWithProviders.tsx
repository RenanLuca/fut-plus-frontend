import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/src/app/contexts/AuthContext";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  route?: string;
  authenticated?: boolean;
};

export function renderWithProviders(
  ui: ReactElement,
  {
    route = "/",
    authenticated = true,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  if (authenticated) {
    authTokenStorage.set("test-token");
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>,
    renderOptions,
  );
  return { queryClient, ...result };
}
