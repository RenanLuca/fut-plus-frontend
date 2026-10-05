import { describe, expect, it } from "vitest";
import { authTokenStorage } from "./auth-token-storage";

describe("authTokenStorage", () => {
  it("should have no token at first", () => {
    expect(authTokenStorage.get()).toBeNull();
  });

  it("should store and read the token", () => {
    authTokenStorage.set("abc123");

    expect(authTokenStorage.get()).toBe("abc123");
  });

  it("should keep the token in the browser storage under the app key", () => {
    authTokenStorage.set("abc123");

    expect(localStorage.getItem("@fut-plus:token")).toBe("abc123");
  });

  it("should replace the previous token", () => {
    authTokenStorage.set("old");
    authTokenStorage.set("new");

    expect(authTokenStorage.get()).toBe("new");
  });

  it("should forget the token", () => {
    authTokenStorage.set("abc123");

    authTokenStorage.clear();

    expect(authTokenStorage.get()).toBeNull();
  });
});
