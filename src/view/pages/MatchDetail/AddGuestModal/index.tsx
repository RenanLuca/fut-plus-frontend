import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "../../../components/ui/sheet";
import { AddGuestForm } from "./AddGuestForm";

export function AddGuestModal({
    groupId,
    matchId,
}: {
    groupId: string;
    matchId: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button size="sm" variant="outline" />}>
                <UserPlus className="size-4" />
                Convidado
            </SheetTrigger>
            <SheetContent>
                <AddGuestForm
                    groupId={groupId}
                    matchId={matchId}
                    onAdded={() => setOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
