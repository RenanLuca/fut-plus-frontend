import { ConfirmDialog } from "../../../components/ConfirmDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import type { Group } from "@/src/app/services/groupsService";
import { useTransferOwnershipController } from "./useTransferOwnershipController";

export function TransferOwnershipDialog({
    group,
    open,
    onOpenChange,
}: {
    group: Group;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const {
        candidates,
        selectedUserId,
        setSelectedUserId,
        confirmTransfer,
        isPending,
    } = useTransferOwnershipController(group, () => onOpenChange(false));

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) setSelectedUserId(null);
                onOpenChange(nextOpen);
            }}
            title="Transferir posse do grupo"
            description="A pessoa escolhida vira dona do grupo e você passa a ser mensalista."
            confirmLabel="Transferir posse"
            confirmDisabled={!selectedUserId}
            isPending={isPending}
            onConfirm={confirmTransfer}
        >
            {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Não há outros membros pra receber a posse.
                </p>
            ) : (
                <Select
                    items={candidates}
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um membro" />
                    </SelectTrigger>
                    <SelectContent>
                        {candidates.map((candidate) => (
                            <SelectItem key={candidate.value} value={candidate.value}>
                                {candidate.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </ConfirmDialog>
    );
}
