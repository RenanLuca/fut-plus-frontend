import { Check, Shirt, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
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
import { AddGuestModal } from "./AddGuestModal";
import { GenerateTeamsModal } from "./GenerateTeamsModal";
import { MatchActionsMenu } from "./MatchActionsMenu";
import { TeamCard } from "./TeamCard";
import { UnassignedPlayers } from "./UnassignedPlayers";
import { useMatchDetailController } from "./useMatchDetailController";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

function MemberRow({
    member,
    onRemoveGuest,
}: {
    member: MatchPresenceMember;
    onRemoveGuest?: (member: MatchPresenceMember) => void;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-item-border bg-item p-3">
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
            {member.isGuest && onRemoveGuest && (
                <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Remover ${member.name}`}
                    onClick={() => onRemoveGuest(member)}
                >
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            )}
        </div>
    );
}

function PresenceSection({
    title,
    members,
    emptyText,
    action,
    onRemoveGuest,
}: {
    title: string;
    members: MatchPresenceMember[];
    emptyText: string;
    action?: ReactNode;
    onRemoveGuest?: (member: MatchPresenceMember) => void;
}) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">
                    {title} ({members.length})
                </h2>
                {action}
            </div>
            {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyText}</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {members.map((member) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            onRemoveGuest={onRemoveGuest}
                        />
                    ))}
                </div>
            )}
        </section>
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
        guestToRemove,
        setGuestToRemove,
        confirmRemoveGuest,
        isRemovingGuest,
        unassignedPlayers,
        movePlayer,
        isMovingPlayer,
    } = useMatchDetailController();

    if (isLoadingMatch || !match) {
        return (
            <PageWrapper>
                <div className="h-24 animate-pulse rounded-xl bg-primary-100" />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper
            title={
                <>
                    <h1 className="text-xl font-bold text-primary-900 first-letter:uppercase">
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
                <div className="h-24 animate-pulse rounded-xl bg-primary-100" />
            )}

            {!isLoadingPresences && presences && (
                <>
                    <PresenceSection
                        title="Confirmados"
                        members={presences.confirmed}
                        emptyText="Ninguém confirmou ainda"
                        action={
                            isOwner && (
                                <AddGuestModal groupId={groupId!} matchId={matchId!} />
                            )
                        }
                        onRemoveGuest={isOwner ? setGuestToRemove : undefined}
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
                    <div className="h-24 animate-pulse rounded-xl bg-primary-100" />
                )}

                {!isLoadingTeams && teams.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-primary-200 bg-item py-10 text-center">
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
                    <>
                        {isOwner && (
                            <p className="text-xs text-muted-foreground">
                                Toque em um jogador para movê-lo de time.
                            </p>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {teams.map((team) => (
                                <TeamCard
                                    key={team.id}
                                    team={team}
                                    teams={teams}
                                    groupId={groupId!}
                                    matchId={matchId!}
                                    isOwner={isOwner}
                                    onMovePlayer={movePlayer}
                                    isMovingPlayer={isMovingPlayer}
                                />
                            ))}
                        </div>
                        {unassignedPlayers.length > 0 && (
                            <UnassignedPlayers
                                players={unassignedPlayers}
                                teams={teams}
                                isOwner={isOwner}
                                onMovePlayer={movePlayer}
                                isMovingPlayer={isMovingPlayer}
                            />
                        )}
                    </>
                )}
            </section>

            <ConfirmDialog
                open={!!guestToRemove}
                onOpenChange={(open) => {
                    if (!open) setGuestToRemove(null);
                }}
                title="Remover convidado?"
                description={`${guestToRemove?.name ?? "O convidado"} será removido desta partida, inclusive do time em que estiver.`}
                confirmLabel="Remover"
                isPending={isRemovingGuest}
                onConfirm={() => guestToRemove && confirmRemoveGuest(guestToRemove.id)}
            />
        </PageWrapper>
    );
}
