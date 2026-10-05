import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { useAuthRedirect } from "./useAuthRedirect";

function renderAuthRedirect(search: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/${search}`]}>{children}</MemoryRouter>
  );
  return renderHook(() => useAuthRedirect(), { wrapper }).result.current;
}

describe("useAuthRedirect", () => {
  describe("redirectTo", () => {
    it("should go to home when there is no redirect param", () => {
      expect(renderAuthRedirect("").redirectTo).toBe("/home");
    });

    it.each(["/groups/123", "/groups/123/matches/456", "/profile", "/invite/abc?x=1"])(
      "should accept the internal path %s",
      (path) => {
        const { redirectTo } = renderAuthRedirect(
          `?redirect=${encodeURIComponent(path)}`,
        );

        expect(redirectTo).toBe(path);
      },
    );

    it.each([
      ["a full external url", "https://evil.com"],
      ["a protocol-relative url", "//evil.com"],
      ["a backslash trick", "/\\evil.com"],
      ["a path without the leading slash", "groups/123"],
      ["javascript", "javascript:alert(1)"],
      ["an empty value", ""],
    ])("should fall back to home for %s", (_, value) => {
      const { redirectTo } = renderAuthRedirect(
        `?redirect=${encodeURIComponent(value)}`,
      );

      expect(redirectTo).toBe("/home");
    });
  });

  describe("withRedirect", () => {
    it("should leave the path as it is when there is nothing to carry over", () => {
      expect(renderAuthRedirect("").withRedirect("/signup")).toBe("/signup");
    });

    it("should carry a safe redirect over to the next page, encoded", () => {
      const { withRedirect } = renderAuthRedirect(
        `?redirect=${encodeURIComponent("/groups/123")}`,
      );

      expect(withRedirect("/signup")).toBe("/signup?redirect=%2Fgroups%2F123");
    });

    it("should not carry over an unsafe redirect", () => {
      const { withRedirect } = renderAuthRedirect(
        `?redirect=${encodeURIComponent("//evil.com")}`,
      );

      expect(withRedirect("/signup")).toBe("/signup");
    });
  });
});
