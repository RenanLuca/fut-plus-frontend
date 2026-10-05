import { afterAll, afterEach, beforeAll, expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/vitest";
import toast from "react-hot-toast";
import { server } from "./mocks/server";

expect.extend(matchers);

// jsdom não implementa matchMedia, e o Toaster do react-hot-toast usa
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  toast.remove();
});

afterAll(() => server.close());
