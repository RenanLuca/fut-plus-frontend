import { Calendar, Pencil, Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { WEEKDAY_LABELS } from "@/src/app/constants/weekday";
import { FREQUENCY_LABELS } from "@/src/app/constants/frequencyType";
import { GROUP_MEMBER_TYPE_LABELS } from "@/src/app/constants/groupMemberType";
import { getInitials } from "@/src/app/utils/get-initials";
import type { GroupMember } from "@/src/app/services/groupMembersService";
import type { GroupMatch } from "@/src/app/services/groupMatchesService";
import { useGroupDetailController } from "./useGroupDetailController";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

function MemberRow({ member }: { member: GroupMember }) {
    const name = member.user?.name ?? member.guestUser?.name ?? "—";
    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
            <Avatar size="sm">
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">
                    {GROUP_MEMBER_TYPE_LABELS[member.type]}
                </span>
            </div>
        </div>
    );
}

function MatchRow({ match }: { match: GroupMatch }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white p-3">
            <Calendar className="size-4 text-primary-900" />
            <span className="text-sm font-medium capitalize">
                {dateFormatter.format(new Date(match.matchDate))}
            </span>
        </div>
    );
}

export function GroupDetailPage() {
    const {
        group,
        isLoadingGroup,
        members,
        isLoadingMembers,
        matches,
        isLoadingMatches,
        isOwner,
    } = useGroupDetailController();

    if (isLoadingGroup || !group) {
        return <div className="h-24 animate-pulse rounded-xl bg-gray-100" />;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-xl font-bold text-primary-900">{group.name}</h1>
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded-full bg-pale-100 px-2 py-0.5">
                            {WEEKDAY_LABELS[group.weekday]}, {group.hour}
                        </span>
                        <span className="rounded-full bg-pale-100 px-2 py-0.5">
                            {FREQUENCY_LABELS[group.frequency]}
                        </span>
                    </div>
                </div>
                {isOwner && (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        aria-label="Editar grupo"
                    >
                        <Pencil className="size-4" />
                    </Button>
                )}
            </div>

            <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-gray-700">Membros</h2>
                {isLoadingMembers && (
                    <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                )}
                {!isLoadingMembers && members.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum membro ainda</p>
                )}
                {!isLoadingMembers && members.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {members.map((member) => (
                            <MemberRow key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">Partidas</h2>
                    {group.frequency === "EVENTUAL" && (
                        <Button size="sm" disabled>
                            <Plus className="size-4" />
                            Criar partida
                        </Button>
                    )}
                </div>
                {isLoadingMatches && (
                    <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
                )}
                {!isLoadingMatches && matches.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma partida marcada</p>
                )}
                {!isLoadingMatches && matches.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {matches.map((match) => (
                            <MatchRow key={match.id} match={match} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
