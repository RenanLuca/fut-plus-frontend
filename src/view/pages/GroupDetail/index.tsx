import { CalendarX, ChevronRight, Users } from "lucide-react";
import { Link } from "react-router";
import { PageWrapper } from "../../components/PageWrapper";
import { UpcomingMatchCard } from "../../components/UpcomingMatchCard";
import { WEEKDAY_LABELS } from "@/src/app/constants/weekday";
import { FREQUENCY_LABELS } from "@/src/app/constants/frequencyType";
import { CreateMatchModal } from "./CreateMatchModal";
import { GroupActionsMenu } from "./GroupActionsMenu";
import { useGroupDetailController } from "./useGroupDetailController";

export function GroupDetailPage() {
    const {
        group,
        isLoadingGroup,
        membersCount,
        nextMatch,
        isLoadingMatches,
        isOwner,
    } = useGroupDetailController();

    if (isLoadingGroup || !group) {
        return (
            <PageWrapper>
                <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            title={
                <>
                    <h1 className="text-xl font-bold text-primary-900">{group.name}</h1>
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded-full bg-pale-100 px-2 py-0.5">
                            {WEEKDAY_LABELS[group.weekday]}, {group.hour}
                        </span>
                        <span className="rounded-full bg-pale-100 px-2 py-0.5">
                            {FREQUENCY_LABELS[group.frequency]}
                        </span>
                    </div>
                </>
            }
            actions={isOwner && <GroupActionsMenu group={group} />}
        >
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">Próxima partida</h2>
                    {isOwner && group.frequency === "EVENTUAL" && (
                        <CreateMatchModal groupId={group.id} />
                    )}
                </div>

                {isLoadingMatches && (
                    <div className="h-32 animate-pulse rounded-xl bg-gray-100" />
                )}

                {!isLoadingMatches && nextMatch && (
                    <UpcomingMatchCard
                        match={nextMatch}
                        groupName={group.name}
                        to={`/groups/${group.id}/matches/${nextMatch.id}`}
                    />
                )}

                {!isLoadingMatches && !nextMatch && (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center">
                        <CalendarX className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-gray-700">
                            Nenhuma partida marcada
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {group.frequency === "EVENTUAL"
                                ? isOwner
                                    ? "Crie uma partida pra começar"
                                    : "O dono do grupo ainda não marcou a próxima"
                                : "As partidas mensais são geradas automaticamente 5 dias antes"}
                        </p>
                    </div>
                )}
            </section>

            <Link
                to={`/groups/${group.id}/members`}
                className="flex items-center justify-between rounded-lg bg-ice-100 p-3 transition-colors hover:bg-ice-300"
            >
                <span className="flex items-center gap-2 text-sm font-medium">
                    <Users className="size-4 text-primary-900" />
                    Membros
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    {membersCount ?? "—"}
                    <ChevronRight className="size-4" />
                </span>
            </Link>
        </PageWrapper>
    );
}
