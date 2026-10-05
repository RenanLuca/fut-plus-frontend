import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "@/src/app/hooks/useAuth";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";

function AuthProbe() {
  const { token, isAuthenticated, login, logout } = useAuth();
  return (
    <>
      <p>token: {token ?? "none"}</p>
      <p>authenticated: {String(isAuthenticated)}</p>
      <button onClick={() => login("new-token")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </>
  );
}

function renderAuthProbe() {
  render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  );
  return userEvent.setup();
}

describe("AuthProvider", () => {
  it("should start logged out when there is no stored token", () => {
    renderAuthProbe();

    expect(screen.getByText("token: none")).toBeInTheDocument();
    expect(screen.getByText("authenticated: false")).toBeInTheDocument();
  });

  it("should start logged in when a token is already stored", () => {
    authTokenStorage.set("stored-token");

    renderAuthProbe();

    expect(screen.getByText("token: stored-token")).toBeInTheDocument();
    expect(screen.getByText("authenticated: true")).toBeInTheDocument();
  });

  it("should log in: keep the token in memory and in the storage", async () => {
    const user = renderAuthProbe();

    await user.click(screen.getByRole("button", { name: "login" }));

    expect(screen.getByText("token: new-token")).toBeInTheDocument();
    expect(screen.getByText("authenticated: true")).toBeInTheDocument();
    expect(authTokenStorage.get()).toBe("new-token");
  });

  it("should log out: forget the token everywhere", async () => {
    authTokenStorage.set("stored-token");
    const user = renderAuthProbe();

    await user.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByText("token: none")).toBeInTheDocument();
    expect(screen.getByText("authenticated: false")).toBeInTheDocument();
    expect(authTokenStorage.get()).toBeNull();
  });
});

describe("useAuth", () => {
  it("should refuse to work outside the AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<AuthProbe />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});
