import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/app/lib/query-keys";
import {
  replaceAll as replaceRosters,
  type MatchTeamRoster,
  type MatchTeamRosterPlayer,
} from "@/src/app/services/matchTeamPlayersService";
import type {
  MatchTeam,
  MatchTeamPlayer,
} from "@/src/app/services/matchTeamsService";

export type PlayerRef = { id: string; isGuest: boolean };

export function getTeamPlayerRef(player: MatchTeamPlayer): PlayerRef {
  return player.user
    ? { id: player.user.id, isGuest: false }
    : { id: player.guestUser!.id, isGuest: true };
}

function toRosterPlayer(player: PlayerRef): MatchTeamRosterPlayer {
  return player.isGuest ? { guestUserId: player.id } : { userId: player.id };
}

export function useMovePlayerController(
  groupId: string,
  matchId: string,
  teams: MatchTeam[],
) {
  const queryClient = useQueryClient();

  const { mutate: replaceRoster, isPending: isMovingPlayer } = useMutation({
    mutationFn: (roster: MatchTeamRoster[]) =>
      replaceRosters(groupId, matchId, roster),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchTeams(groupId, matchId),
      });
      toast.success("Jogador movido");
    },
    onError: () => {
      toast.error("Não foi possível mover o jogador. Tente novamente.");
    },
  });

  function movePlayer(player: PlayerRef, targetTeamId: string | null) {
    const roster = teams.map((team) => {
      const players = team.matchTeamPlayers
        .map(getTeamPlayerRef)
        .filter((current) => current.id !== player.id);
      if (team.id === targetTeamId) {
        players.push(player);
      }
      return {
        matchTeamId: team.id,
        players: players.map(toRosterPlayer),
      };
    });
    replaceRoster(roster);
  }

  return { movePlayer, isMovingPlayer };
}
