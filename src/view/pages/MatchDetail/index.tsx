import { Check, Shirt, X } from "lucide-react";
import { PageWrapper } from "../../components/PageWrapper";
import { Button } from "../../components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../components/ui/avatar";
import { cn } from "@/src/app/utils/cn";
import { getInitials } from "@/src/app/utils/get-initials";
import type { MatchPresenceMember } from "@/src/app/services/matchPresencesService";
import type { MatchTeam } from "@/src/app/services/matchTeamsService";
import { GenerateTeamsModal } from "./GenerateTeamsModal";
import { MatchActionsMenu } from "./MatchActionsMenu";
import { useMatchDetailController } from "./useMatchDetailController";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

function MemberRow({ member }: { member: MatchPresenceMember }) {
    return (
        <div className="flex items-center gap-3 rounded-lg bg-ice-100 p-3">
            <Avatar size="sm">
                {member.profilePicture && <AvatarImage src={member.profilePicture} />}
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{member.name}</span>
                {member.isGuest && (
                    <span className="text-xs text-muted-foreground">Convidado</span>
                )}
            </div>
        </div>
    );
}

function PresenceSection({
    title,
    members,
    emptyText,
}: {
    title: string;
    members: MatchPresenceMember[];
    emptyText: string;
}) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-700">
                {title} ({members.length})
            </h2>
            {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyText}</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {members.map((member) => (
                        <MemberRow key={member.id} member={member} />
                    ))}
                </div>
            )}
        </section>
    );
}

function TeamCard({ team }: { team: MatchTeam }) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
                <span
                    className="size-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: team.color }}
                />
                <span className="font-semibold text-primary-900">{team.name}</span>
                <span className="text-xs text-muted-foreground">
                    ({team.matchTeamPlayers.length})
                </span>
            </div>
            {team.matchTeamPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem jogadores</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {team.matchTeamPlayers.map((player, index) => {
                        const name = player.user?.name ?? player.guestUser?.name ?? "—";
                        return (
                            <div key={index} className="flex items-center gap-2">
                                <Avatar size="sm">
                                    {player.user?.profilePicture && (
                                        <AvatarImage src={player.user.profilePicture} />
                                    )}
                                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{name}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function MatchDetailPage() {
    const {
        groupId,
        matchId,
        group,
        match,
        isLoadingMatch,
        presences,
        isLoadingPresences,
        myStatus,
        setPresence,
        isPending,
        teams,
        isLoadingTeams,
        isOwner,
    } = useMatchDetailController();

    if (isLoadingMatch || !match) {
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
                    <h1 className="text-xl font-bold text-primary-900 capitalize">
                        {dateFormatter.format(new Date(match.matchDate))}
                    </h1>
                    {group && (
                        <span className="text-xs text-muted-foreground">{group.name}</span>
                    )}
                </>
            }
            actions={
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => setPresence(true)}
                        className={cn(
                            myStatus === "confirmed" &&
                                "bg-grass-500 text-forest-900 hover:bg-grass-500/90",
                        )}
                    >
                        <Check className="size-4" />
                        Vou
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => setPresence(false)}
                        className={cn(
                            myStatus === "declined" &&
                                "border-destructive bg-destructive/10 text-destructive",
                        )}
                    >
                        <X className="size-4" />
                        Não vou
                    </Button>
                    {isOwner && (
                        <MatchActionsMenu groupId={groupId!} matchId={matchId!} />
                    )}
                </div>
            }
        >
            {isLoadingPresences && (
                <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            )}

            {!isLoadingPresences && presences && (
                <>
                    <PresenceSection
                        title="Confirmados"
                        members={presences.confirmed}
                        emptyText="Ninguém confirmou ainda"
                    />
                    <PresenceSection
                        title="Pendentes"
                        members={presences.pending}
                        emptyText="Todo mundo já respondeu"
                    />
                    <PresenceSection
                        title="Ausentes"
                        members={presences.declined}
                        emptyText="Ninguém avisou que vai faltar"
                    />
                </>
            )}

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">Times</h2>
                    {isOwner && (
                        <GenerateTeamsModal
                            groupId={groupId!}
                            matchId={matchId!}
                            hasTeams={teams.length > 0}
                        />
                    )}
                </div>

                {isLoadingTeams && (
                    <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                )}

                {!isLoadingTeams && teams.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center">
                        <Shirt className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-gray-700">
                            Nenhum time gerado ainda
                        </p>
                        {!isOwner && (
                            <p className="text-xs text-muted-foreground">
                                Só o dono do grupo pode gerar os times
                            </p>
                        )}
                    </div>
                )}

                {!isLoadingTeams && teams.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {teams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                )}
            </section>
        </PageWrapper>
    );
}
