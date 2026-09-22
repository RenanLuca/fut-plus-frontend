import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../../components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "../../../../../components/ui/sheet";
import { RegisterPaymentForm } from "./RegisterPaymentForm";

export function RegisterPaymentModal({
    groupId,
    isDaily,
    monthName,
    className,
}: {
    groupId: string;
    isDaily: boolean;
    monthName: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button size="sm" className={className} />}>
                <Plus className="size-4" />
                Registrar pagamento
            </SheetTrigger>
            <SheetContent>
                <RegisterPaymentForm
                    groupId={groupId}
                    isDaily={isDaily}
                    monthName={monthName}
                    onRegistered={() => setOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
