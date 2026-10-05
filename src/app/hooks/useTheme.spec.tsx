import { describe, expect, it, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/src/app/contexts/ThemeProvider";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  it("should expose the current theme and a way to change it", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("system");
    expect(typeof result.current.setTheme).toBe("function");
  });

  it("should refuse to work outside the ThemeProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    function Probe() {
      useTheme();
      return null;
    }

    expect(() => render(<Probe />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
  });
});
