import { GroupOverview } from "./GroupOverview";
import { MyPaymentStatus } from "./MyPaymentStatus";
import { MyPaymentsHistory } from "./MyPaymentsHistory";
import { useGroupPaymentsController } from "./useGroupPaymentsController";

export function GroupPaymentsPage() {
    const { groupId, isOwner } = useGroupPaymentsController();

    return (
        <>
            {isOwner && <GroupOverview groupId={groupId} />}
            <section className="flex flex-col gap-4">
                <h2 className="text-sm font-semibold text-gray-700">Meus pagamentos</h2>
                <MyPaymentStatus groupId={groupId} />
                <MyPaymentsHistory groupId={groupId} />
            </section>
        </>
    );
}
