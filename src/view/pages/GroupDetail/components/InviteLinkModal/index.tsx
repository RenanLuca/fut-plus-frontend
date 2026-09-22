import { Sheet, SheetContent } from "../../../../components/ui/sheet";
import { InviteLinkContent } from "./InviteLinkContent";

export function InviteLinkModal({
    groupId,
    open,
    onOpenChange,
}: {
    groupId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent>
                <InviteLinkContent groupId={groupId} />
            </SheetContent>
        </Sheet>
    );
}
