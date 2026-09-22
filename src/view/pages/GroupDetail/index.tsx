import { CalendarX } from "lucide-react";
import { UpcomingMatchCard } from "../../components/UpcomingMatchCard";
import { CreateMatchModal } from "./components/CreateMatchModal";
import { useGroupDetailController } from "./useGroupDetailController";

export function GroupDetailPage() {
    const { group, nextMatch, isLoadingMatches, isOwner } =
        useGroupDetailController();

    if (!group) {
        return null;
    }

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-medium">Próxima partida</h2>
                {isOwner && group.frequency === "EVENTUAL" && (
                    <CreateMatchModal groupId={group.id} />
                )}
            </div>

            {isLoadingMatches && (
                <div className="h-32 animate-pulse rounded-xl bg-soft-strong" />
            )}

            {!isLoadingMatches && nextMatch && (
                <UpcomingMatchCard
                    match={nextMatch}
                    groupName={group.name}
                />
            )}

            {!isLoadingMatches && !nextMatch && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface py-10 text-center">
                    <CalendarX className="size-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-medium">
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
    );
}
