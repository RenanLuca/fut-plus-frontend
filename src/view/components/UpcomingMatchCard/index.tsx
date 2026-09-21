import { Calendar, Check, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarGroup } from "../ui/avatar";
import { cn } from "@/src/app/utils/cn";
import { getInitials } from "@/src/app/utils/get-initials";
import { useMatchPresence } from "@/src/app/hooks/useMatchPresence";

type UpcomingMatchCardProps = {
    match: { id: string; groupId: string; matchDate: string };
    groupName: string;
    to: string;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

export function UpcomingMatchCard({
    match,
    groupName,
    to,
}: UpcomingMatchCardProps) {
    const { presences, isLoadingPresences, myStatus, setPresence, isPending } =
        useMatchPresence(match.groupId, match.id);

    return (
        <div className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-linear-to-br from-primary-900 to-forest-900 p-5 text-white">
            <Link to={to} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium tracking-wide text-primary-200 uppercase">
                        Próxima partida
                    </span>
                    <Calendar className="size-4" />
                </div>
                <span className="text-lg font-bold capitalize">
                    {dateFormatter.format(new Date(match.matchDate))}
                </span>
                <span className="text-sm text-white/80">{groupName}</span>
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {!isLoadingPresences && presences && presences.confirmed.length > 0 && (
                        <AvatarGroup>
                            {presences.confirmed.slice(0, 4).map((member) => (
                                <Avatar key={member.id} size="sm">
                                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </AvatarGroup>
                    )}
                    <span className="text-xs text-white/80">
                        {presences
                            ? `${presences.confirmed.length} confirmado${presences.confirmed.length === 1 ? "" : "s"}`
                            : ""}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => setPresence(true)}
                        className={cn(
                            "bg-white text-primary-900 hover:bg-white/90",
                            myStatus === "confirmed" &&
                                "bg-grass-500 text-forest-900 hover:bg-grass-500/90",
                        )}
                    >
                        <Check className="size-4" />
                        Vou
                    </Button>
                    <Button
                        size="sm"
                        disabled={isPending}
                        onClick={() => setPresence(false)}
                        className={cn(
                            "bg-white text-primary-900 hover:bg-white/90",
                            myStatus === "declined" &&
                                "bg-destructive text-white hover:bg-destructive/90",
                        )}
                    >
                        <X className="size-4" />
                        Não vou
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function NoUpcomingMatch() {
    return (
        <div className="flex w-full max-w-md flex-col items-center justify-center gap-1.5 rounded-xl bg-linear-to-br from-primary-900 to-forest-900 p-6 text-center text-white">
            <Calendar className="size-6 text-white/80" />
            <span className="text-sm font-medium">Nenhuma partida marcada ainda</span>
            <span className="text-xs text-white/70">
                Crie uma partida em um dos seus grupos pra ela aparecer aqui
            </span>
        </div>
    );
}
