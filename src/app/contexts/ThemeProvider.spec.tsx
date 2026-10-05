import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "./ThemeProvider";
import { THEME_STORAGE_KEY } from "./ThemeContext";
import { useTheme } from "@/src/app/hooks/useTheme";

function ThemeProbe() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <p>current theme: {theme}</p>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("system")}>system</button>
    </>
  );
}

function renderThemeProvider() {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  );
  return userEvent.setup();
}

// Simula o `prefers-color-scheme` do sistema e permite trocá-lo em tempo real
function mockSystemPreference(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<() => void>();
  window.matchMedia = ((query: string) => ({
    get matches() {
      return dark;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  return {
    setDark(next: boolean) {
      dark = next;
      act(() => listeners.forEach((listener) => listener()));
    },
    listenerCount: () => listeners.size,
  };
}

describe("ThemeProvider", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    mockSystemPreference(false);
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  describe("initial theme", () => {
    it("should follow the system when nothing is stored", () => {
      renderThemeProvider();

      expect(screen.getByText("current theme: system")).toBeInTheDocument();
    });

    it.each(["light", "dark", "system"])(
      "should start with the stored '%s' theme",
      (stored) => {
        localStorage.setItem(THEME_STORAGE_KEY, stored);

        renderThemeProvider();

        expect(screen.getByText(`current theme: ${stored}`)).toBeInTheDocument();
      },
    );

    it("should ignore a stored value that is not a theme", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "purple");

      renderThemeProvider();

      expect(screen.getByText("current theme: system")).toBeInTheDocument();
    });
  });

  describe("choosing a theme", () => {
    it("should apply the dark class and remember the choice", async () => {
      const user = renderThemeProvider();

      await user.click(screen.getByRole("button", { name: "dark" }));

      expect(document.documentElement).toHaveClass("dark");
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    });

    it("should remove the dark class when the user goes back to light", async () => {
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
      const user = renderThemeProvider();
      expect(document.documentElement).toHaveClass("dark");

      await user.click(screen.getByRole("button", { name: "light" }));

      expect(document.documentElement).not.toHaveClass("dark");
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    });

    it("should keep working for the session when the storage is blocked", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });

      const user = renderThemeProvider();
      expect(screen.getByText("current theme: system")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "dark" }));

      expect(screen.getByText("current theme: dark")).toBeInTheDocument();
      expect(document.documentElement).toHaveClass("dark");
    });
  });

  describe("system theme", () => {
    it("should use the dark class when the system prefers dark", () => {
      mockSystemPreference(true);

      renderThemeProvider();

      expect(document.documentElement).toHaveClass("dark");
    });

    it("should follow the system while it changes", () => {
      const system = mockSystemPreference(false);
      renderThemeProvider();
      expect(document.documentElement).not.toHaveClass("dark");

      system.setDark(true);
      expect(document.documentElement).toHaveClass("dark");

      system.setDark(false);
      expect(document.documentElement).not.toHaveClass("dark");
    });

    it("should stop following the system once the user picks a theme", async () => {
      const system = mockSystemPreference(false);
      const user = renderThemeProvider();
      expect(system.listenerCount()).toBe(1);

      await user.click(screen.getByRole("button", { name: "light" }));
      system.setDark(true);

      expect(system.listenerCount()).toBe(0);
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });
});
