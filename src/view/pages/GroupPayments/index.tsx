import { GroupOverview } from "./GroupOverview";
import { MyPaymentStatus } from "./MyPaymentStatus";
import { MyPaymentsHistory } from "./MyPaymentsHistory";
import { useGroupPaymentsController } from "./useGroupPaymentsController";

export function GroupPaymentsPage() {
    const { groupId, isReady, isOwner } = useGroupPaymentsController();

    if (!isReady) {
        return <div className="h-24 animate-pulse rounded-xl bg-gray-200" />;
    }

    if (isOwner) {
        return (
            <>
                <MyPaymentStatus groupId={groupId} />
                <GroupOverview groupId={groupId} />
            </>
        );
    }

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-700">Meus pagamentos</h2>
            <MyPaymentStatus groupId={groupId} />
            <MyPaymentsHistory groupId={groupId} />
        </section>
    );
}
