import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import type { MatchTeam } from "@/src/app/services/matchTeamsService";
import { EditTeamModal } from "./EditTeamModal";
import { PlayerIdentity } from "./PlayerIdentity";
import { PlayerMoveMenu } from "./PlayerMoveMenu";
import { getTeamPlayerRef, type PlayerRef } from "../useMovePlayerController";

export function TeamCard({
    team,
    teams,
    groupId,
    matchId,
    isOwner,
    onMovePlayer,
    isMovingPlayer,
}: {
    team: MatchTeam;
    teams: MatchTeam[];
    groupId: string;
    matchId: string;
    isOwner: boolean;
    onMovePlayer: (player: PlayerRef, targetTeamId: string | null) => void;
    isMovingPlayer: boolean;
}) {
    const [editOpen, setEditOpen] = useState(false);

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <span
                    className="size-3 rounded-full border border-line"
                    style={{ backgroundColor: team.color }}
                />
                <span className="font-semibold text-heading">{team.name}</span>
                <span className="text-xs text-muted-foreground">
                    ({team.matchTeamPlayers.length})
                </span>
                {isOwner && (
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        className="ml-auto"
                        aria-label={`Editar ${team.name}`}
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                )}
            </div>
            {team.matchTeamPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem jogadores</p>
            ) : (
                <div className="flex flex-col gap-1">
                    {team.matchTeamPlayers.map((player) => {
                        const ref = getTeamPlayerRef(player);
                        const identity = (
                            <PlayerIdentity
                                name={player.user?.name ?? player.guestUser?.name ?? "—"}
                                profilePicture={player.user?.profilePicture ?? null}
                                isGuest={ref.isGuest}
                            />
                        );
                        return isOwner ? (
                            <PlayerMoveMenu
                                key={ref.id}
                                player={ref}
                                currentTeamId={team.id}
                                teams={teams}
                                onMove={onMovePlayer}
                                disabled={isMovingPlayer}
                            >
                                {identity}
                            </PlayerMoveMenu>
                        ) : (
                            <div key={ref.id} className="p-1">
                                {identity}
                            </div>
                        );
                    })}
                </div>
            )}
            {isOwner && (
                <EditTeamModal
                    groupId={groupId}
                    matchId={matchId}
                    team={team}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            )}
        </div>
    );
}
