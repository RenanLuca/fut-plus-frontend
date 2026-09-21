import type { GroupMatch } from "@/src/app/services/groupMatchesService";

export function getNextMatch(matches: GroupMatch[]): GroupMatch | undefined {
  const now = Date.now();

  return matches
    .filter((match) => new Date(match.matchDate).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
    )[0];
}
