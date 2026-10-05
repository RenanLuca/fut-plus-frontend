import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { httpClient } from "./http-client";
import { authTokenStorage } from "./auth-token-storage";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";

function captureRequest() {
  const captured: { url?: string; authorization?: string | null } = {};
  server.use(
    http.get(`${API_URL}/ping`, ({ request }) => {
      captured.url = request.url;
      captured.authorization = request.headers.get("authorization");
      return HttpResponse.json({ ok: true });
    }),
  );
  return captured;
}

describe("httpClient", () => {
  it("should send requests to the configured API url", async () => {
    const captured = captureRequest();

    await httpClient.get("/ping");

    expect(captured.url).toBe(`${API_URL}/ping`);
  });

  it("should not send an Authorization header when there is no session", async () => {
    const captured = captureRequest();

    await httpClient.get("/ping");

    expect(captured.authorization).toBeNull();
  });

  it("should send the stored token as a bearer token", async () => {
    authTokenStorage.set("my-token");
    const captured = captureRequest();

    await httpClient.get("/ping");

    expect(captured.authorization).toBe("Bearer my-token");
  });

  it("should pick up a token stored after the client was created", async () => {
    const captured = captureRequest();
    await httpClient.get("/ping");
    expect(captured.authorization).toBeNull();

    authTokenStorage.set("late-token");
    await httpClient.get("/ping");

    expect(captured.authorization).toBe("Bearer late-token");
  });

  it("should stop sending the token once the session is cleared", async () => {
    authTokenStorage.set("my-token");
    authTokenStorage.clear();
    const captured = captureRequest();

    await httpClient.get("/ping");

    expect(captured.authorization).toBeNull();
  });
});
