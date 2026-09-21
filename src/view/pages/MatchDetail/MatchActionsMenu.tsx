import { EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Button } from "../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useMatchActionsController } from "./useMatchActionsController";

export function MatchActionsMenu({
    groupId,
    matchId,
}: {
    groupId: string;
    matchId: string;
}) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const { deleteMatch, isDeleting } = useMatchActionsController(
        groupId,
        matchId,
    );

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label="Ações da partida"
                        />
                    }
                >
                    <EllipsisVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setConfirmingDelete(true)}
                    >
                        <Trash2 />
                        Apagar partida
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={confirmingDelete}
                onOpenChange={setConfirmingDelete}
                title="Apagar partida?"
                description="Presenças, times e pagamentos ligados a esta partida serão apagados. Essa ação não pode ser desfeita."
                confirmLabel="Apagar partida"
                isPending={isDeleting}
                onConfirm={() => deleteMatch()}
            />
        </>
    );
}
