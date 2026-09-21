import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "../../../components/ui/sheet";
import type { Group } from "@/src/app/services/groupsService";
import { GroupForm } from "./GroupForm";
import type { GroupFormMode } from "./useGroupFormController";

export type GroupFormModalProps =
    | { mode: "create" }
    | {
        mode: "edit";
        group: Group;
        open: boolean;
        onOpenChange: (open: boolean) => void;
    };

export function GroupFormModal(props: GroupFormModalProps) {
    const [createOpen, setCreateOpen] = useState(false);

    const open = props.mode === "edit" ? props.open : createOpen;
    const onOpenChange =
        props.mode === "edit" ? props.onOpenChange : setCreateOpen;
    const formMode: GroupFormMode =
        props.mode === "edit"
            ? { mode: "edit", group: props.group }
            : { mode: "create" };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {props.mode === "create" && (
                <SheetTrigger render={<Button size="sm" />}>
                    <Plus className="size-4" />
                    Criar grupo
                </SheetTrigger>
            )}
            <SheetContent>
                <GroupForm {...formMode} onSaved={() => onOpenChange(false)} />
            </SheetContent>
        </Sheet>
    );
}
