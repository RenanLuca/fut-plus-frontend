import { Calendar, Check, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../../../components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
} from "../../../components/ui/avatar";
import { cn } from "@/src/app/utils/cn";
import { getInitials } from "@/src/app/utils/get-initials";
import type { UpcomingMatch } from "@/src/app/services/usersService";
import { useUpcomingMatchCardController } from "./useUpcomingMatchCardController";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
});

export function UpcomingMatchCard({ match }: { match: UpcomingMatch }) {
    const { presences, isLoadingPresences, myStatus, setPresence, isPending } =
        useUpcomingMatchCardController(match);

    return (
        <div className="flex flex-col gap-4 rounded-xl bg-linear-to-br from-primary-900 to-forest-900 p-5 text-white">
            <Link to={`/groups/${match.groupId}`} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium tracking-wide text-primary-200 uppercase">
                        Próxima partida
                    </span>
                    <Calendar className="size-4" />
                </div>
                <span className="text-lg font-bold capitalize">
                    {dateFormatter.format(new Date(match.matchDate))}
                </span>
                <span className="text-sm text-white/80">{match.group.name}</span>
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
                            "border border-white/30 bg-white/10 text-white hover:bg-white/20",
                            myStatus === "confirmed" && "bg-white text-primary-900 hover:bg-white/90",
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
                            "border border-white/30 bg-white/10 text-white hover:bg-white/20",
                            myStatus === "declined" && "bg-white text-primary-900 hover:bg-white/90",
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
