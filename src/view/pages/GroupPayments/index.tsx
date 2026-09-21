import { GroupOverview } from "./GroupOverview";
import { MyPayments } from "./MyPayments";
import { useGroupPaymentsController } from "./useGroupPaymentsController";

export function GroupPaymentsPage() {
    const { groupId, isOwner } = useGroupPaymentsController();

    return (
        <>
            {isOwner && <GroupOverview groupId={groupId} />}
            <MyPayments groupId={groupId} />
        </>
    );
}
