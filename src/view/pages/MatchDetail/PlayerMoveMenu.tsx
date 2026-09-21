import type { ReactNode } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import type { MatchTeam } from "@/src/app/services/matchTeamsService";
import type { PlayerRef } from "./useMovePlayerController";

export function PlayerMoveMenu({
    player,
    currentTeamId,
    teams,
    onMove,
    disabled,
    children,
}: {
    player: PlayerRef;
    currentTeamId: string | null;
    teams: MatchTeam[];
    onMove: (player: PlayerRef, targetTeamId: string | null) => void;
    disabled: boolean;
    children: ReactNode;
}) {
    const otherTeams = teams.filter((team) => team.id !== currentTeamId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                disabled={disabled}
                render={
                    <button
                        type="button"
                        className="w-full rounded-md p-1 transition-colors hover:bg-primary-100 disabled:opacity-60"
                    />
                }
            >
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {otherTeams.map((team) => (
                    <DropdownMenuItem
                        key={team.id}
                        onClick={() => onMove(player, team.id)}
                    >
                        <span
                            className="size-3 rounded-full border border-gray-200"
                            style={{ backgroundColor: team.color }}
                        />
                        Mover para {team.name}
                    </DropdownMenuItem>
                ))}
                {currentTeamId && otherTeams.length > 0 && <DropdownMenuSeparator />}
                {currentTeamId && (
                    <DropdownMenuItem onClick={() => onMove(player, null)}>
                        Tirar do time
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
