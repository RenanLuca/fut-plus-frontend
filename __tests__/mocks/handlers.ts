import { http, HttpResponse } from "msw";
import { makeUserMock } from "@/__tests__/factories/user";
import { makeMatchPresencesMock } from "../factories/matchPresences";

export const API_URL = import.meta.env.VITE_API_URL;

export function presencesUrl(groupId: string, matchId: string) {
  return `${API_URL}/groups/${groupId}/group-matches/${matchId}/match-presences`;
}

export const handlers = [
  http.get(`${API_URL}/users/me`, () => HttpResponse.json(makeUserMock())),
  http.get(presencesUrl("123", "123"), () =>
    HttpResponse.json(makeMatchPresencesMock({ confirmeds: 10 })),
  ),
];
