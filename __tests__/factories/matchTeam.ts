import type { Position } from "@/src/app/constants/position";
import type { Rank } from "@/src/app/constants/rank";
import type {
  MatchTeam,
  MatchTeamPlayer,
} from "@/src/app/services/matchTeamsService";

type PlayerSource = {
  id: string;
  name: string;
  position?: Position;
  rank?: Rank;
  isGuest?: boolean;
};

export function makeTeamPlayerMock({
  id,
  name,
  position = "DEFENDER",
  rank = "BRASILEIRAO",
  isGuest = false,
}: PlayerSource): MatchTeamPlayer {
  if (isGuest) {
    return {
      user: null,
      guestUser: {
        id,
        groupMatchId: "match-1",
        name,
        position,
        rank,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    };
  }
  return {
    user: { id, name, position, profilePicture: null, rank },
    guestUser: null,
  };
}

export function makeTeamMock({
  id = "team-1",
  name = "Time A",
  color = "#FF0000",
  players = [],
}: {
  id?: string;
  name?: string;
  color?: string;
  players?: PlayerSource[];
} = {}): MatchTeam {
  return {
    id,
    groupMatchId: "match-1",
    name,
    color,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    matchTeamPlayers: players.map(makeTeamPlayerMock),
  };
}
