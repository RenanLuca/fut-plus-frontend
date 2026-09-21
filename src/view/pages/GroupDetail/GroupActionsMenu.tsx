import { EllipsisVertical, LogOut, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Button } from "../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import type { Group } from "@/src/app/services/groupsService";
import { GroupFormModal } from "../Groups/GroupFormModal";
import { useGroupActionsController } from "./useGroupActionsController";

export function GroupActionsMenu({
    group,
    isOwner,
}: {
    group: Group;
    isOwner: boolean;
}) {
    const [editOpen, setEditOpen] = useState(false);
    const [confirming, setConfirming] = useState<"delete" | "leave" | null>(
        null,
    );
    const { deleteGroup, isDeleting, leaveGroup, isLeaving } =
        useGroupActionsController(group.id);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button variant="outline" size="icon" aria-label="Ações do grupo" />
                    }
                >
                    <EllipsisVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {isOwner && (
                        <DropdownMenuItem onClick={() => setEditOpen(true)}>
                            <Pencil />
                            Editar grupo
                        </DropdownMenuItem>
                    )}
                    {isOwner && (
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setConfirming("delete")}
                        >
                            <Trash2 />
                            Apagar grupo
                        </DropdownMenuItem>
                    )}
                    {!isOwner && (
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setConfirming("leave")}
                        >
                            <LogOut />
                            Sair do grupo
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {isOwner && (
                <GroupFormModal
                    mode="edit"
                    group={group}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                />
            )}

            <ConfirmDialog
                open={confirming === "delete"}
                onOpenChange={(open) => !open && setConfirming(null)}
                title="Apagar grupo?"
                description="Membros, partidas, presenças, times e pagamentos do grupo serão apagados. Essa ação não pode ser desfeita."
                confirmLabel="Apagar grupo"
                isPending={isDeleting}
                onConfirm={() => deleteGroup()}
            />
            <ConfirmDialog
                open={confirming === "leave"}
                onOpenChange={(open) => !open && setConfirming(null)}
                title="Sair do grupo?"
                description={`Você deixa de fazer parte de ${group.name} e não vai mais ver as partidas dele.`}
                confirmLabel="Sair do grupo"
                isPending={isLeaving}
                onConfirm={() => leaveGroup()}
            />
        </>
    );
}
