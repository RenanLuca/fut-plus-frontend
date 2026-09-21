import { MyPayments } from "./MyPayments";
import { useGroupPaymentsController } from "./useGroupPaymentsController";

export function GroupPaymentsPage() {
    const { groupId } = useGroupPaymentsController();

    return <MyPayments groupId={groupId} />;
}
