import { describe, expect, it } from "vitest";
import { buildInviteLink } from "./build-invite-link";

describe("buildInviteLink", () => {
  it("should point to the invite page on the current origin", () => {
    expect(buildInviteLink("abc-123")).toBe(
      `${window.location.origin}/invite/abc-123`,
    );
  });
});
