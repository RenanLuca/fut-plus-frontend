import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { isRateLimitError } from "./rate-limit";

function makeAxiosError(status: number) {
  const error = new AxiosError("request failed");
  error.response = {
    status,
    statusText: "",
    data: {},
    headers: {},
    config: { headers: {} } as never,
  };
  return error;
}

describe("isRateLimitError", () => {
  it("should be true for an axios error with status 429", () => {
    expect(isRateLimitError(makeAxiosError(429))).toBe(true);
  });

  it.each([400, 401, 500])("should be false for an axios error with status %d", (status) => {
    expect(isRateLimitError(makeAxiosError(status))).toBe(false);
  });

  it("should be false for an axios error without response", () => {
    expect(isRateLimitError(new AxiosError("network error"))).toBe(false);
  });

  it.each([new Error("429"), "429", null, undefined, { response: { status: 429 } }])(
    "should be false for something that is not an axios error",
    (error) => {
      expect(isRateLimitError(error)).toBe(false);
    },
  );
});
