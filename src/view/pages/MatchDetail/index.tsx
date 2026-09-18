import { Check, X } from "lucide-react";
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

export function MatchDetailPage() {
    const {
        group,
        match,
        isLoadingMatch,
        presences,
        isLoadingPresences,
        myStatus,
        setPresence,
        isPending,
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
        >
            <div className="flex items-center justify-between gap-3 rounded-lg bg-pale-100 p-3">
                <span className="text-sm font-medium text-primary-900">
                    Sua presença
                </span>
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
                </div>
            </div>

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
        </PageWrapper>
    );
}
