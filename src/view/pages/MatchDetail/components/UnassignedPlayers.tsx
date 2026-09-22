import type { MatchPresenceMember } from "@/src/app/services/matchPresencesService";
import type { MatchTeam } from "@/src/app/services/matchTeamsService";
import { PlayerIdentity } from "./PlayerIdentity";
import { PlayerMoveMenu } from "./PlayerMoveMenu";
import type { PlayerRef } from "../useMovePlayerController";

export function UnassignedPlayers({
    players,
    teams,
    isOwner,
    onMovePlayer,
    isMovingPlayer,
}: {
    players: MatchPresenceMember[];
    teams: MatchTeam[];
    isOwner: boolean;
    onMovePlayer: (player: PlayerRef, targetTeamId: string | null) => void;
    isMovingPlayer: boolean;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line-strong bg-surface p-4">
            <div className="flex flex-col">
                <span className="font-semibold text-medium">
                    Sem time ({players.length})
                </span>
                <span className="text-xs text-muted-foreground">
                    Confirmados que ainda não estão em nenhum time
                </span>
            </div>
            <div className="flex flex-col gap-1">
                {players.map((member) => {
                    const identity = (
                        <PlayerIdentity
                            name={member.name}
                            profilePicture={member.profilePicture}
                            isGuest={member.isGuest}
                        />
                    );
                    return isOwner ? (
                        <PlayerMoveMenu
                            key={member.id}
                            player={{ id: member.id, isGuest: member.isGuest }}
                            currentTeamId={null}
                            teams={teams}
                            onMove={onMovePlayer}
                            disabled={isMovingPlayer}
                        >
                            {identity}
                        </PlayerMoveMenu>
                    ) : (
                        <div key={member.id} className="p-1">
                            {identity}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
