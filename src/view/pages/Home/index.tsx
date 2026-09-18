import { PageWrapper } from "../../components/PageWrapper";
import { GroupFormModal } from "../Groups/GroupFormModal";
import { GroupsGrid } from "../Groups/GroupsGrid";
import { NoUpcomingMatch, UpcomingMatchCard } from "./UpcomingMatchCard";
import { useHomeController } from "./useHomeController";

export function HomePage() {
    const {
        user,
        groups,
        isLoadingGroups,
        upcomingMatch,
        isLoadingUpcomingMatch,
    } = useHomeController();
    const firstName = user?.name.split(" ")[0];

    return (
        <PageWrapper title={firstName ? `Olá, ${firstName}!` : "Olá!"}>
            {isLoadingUpcomingMatch && (
                <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
            )}
            {!isLoadingUpcomingMatch &&
                (upcomingMatch ? (
                    <UpcomingMatchCard match={upcomingMatch} />
                ) : (
                    <NoUpcomingMatch />
                ))}

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">Meus grupos</h2>
                    <GroupFormModal mode="create" />
                </div>
                <GroupsGrid groups={groups} isLoading={isLoadingGroups} />
            </section>
        </PageWrapper>
    );
}
