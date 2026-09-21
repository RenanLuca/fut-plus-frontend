import { EllipsisVertical, Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import type { Group } from "@/src/app/services/groupsService";
import { GroupFormModal } from "../Groups/GroupFormModal";

export function GroupActionsMenu({ group }: { group: Group }) {
    const [editOpen, setEditOpen] = useState(false);

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
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil />
                        Editar grupo
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <GroupFormModal
                mode="edit"
                group={group}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </>
    );
}
