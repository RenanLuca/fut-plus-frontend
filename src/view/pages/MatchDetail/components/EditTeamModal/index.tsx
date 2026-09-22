import { Sheet, SheetContent } from "../../../../components/ui/sheet";
import type { MatchTeam } from "@/src/app/services/matchTeamsService";
import { EditTeamForm } from "./EditTeamForm";

export function EditTeamModal({
    groupId,
    matchId,
    team,
    open,
    onOpenChange,
}: {
    groupId: string;
    matchId: string;
    team: MatchTeam;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <EditTeamForm
                    groupId={groupId}
                    matchId={matchId}
                    team={team}
                    onSaved={() => onOpenChange(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
