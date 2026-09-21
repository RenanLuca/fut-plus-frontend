import { PageWrapper } from "../../components/PageWrapper";
import {
    NoUpcomingMatch,
    UpcomingMatchCard,
} from "../../components/UpcomingMatchCard";
import { GroupFormModal } from "../Groups/GroupFormModal";
import { GroupsGrid } from "../Groups/GroupsGrid";
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
                <div className="h-32 animate-pulse rounded-xl bg-soft-strong" />
            )}
            {!isLoadingUpcomingMatch &&
                (upcomingMatch ? (
                    <UpcomingMatchCard
                        match={upcomingMatch}
                        groupName={upcomingMatch.group.name}
                    />
                ) : (
                    <NoUpcomingMatch />
                ))}

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-medium">Meus grupos</h2>
                    <GroupFormModal mode="create" />
                </div>
                <GroupsGrid groups={groups} isLoading={isLoadingGroups} />
            </section>
        </PageWrapper>
    );
}
