import { Calendar, Check, Clock, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarImage,
} from "../ui/avatar";
import { cn } from "@/src/app/utils/cn";
import { getMatchDateParts } from "@/src/app/utils/format-match-date";
import { getInitials } from "@/src/app/utils/get-initials";
import {
    useMatchPresence,
    type MyPresenceStatus,
} from "@/src/app/hooks/useMatchPresence";

type UpcomingMatchCardProps = {
    match: { id: string; groupId: string; matchDate: string };
    groupName: string;
    to: string;
};

const CARD_BACKGROUND =
    "bg-linear-to-br from-primary-900 to-forest-900 text-white shadow-md";

function StatusChip({ status }: { status: MyPresenceStatus }) {
    if (status === "confirmed") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-grass-500 px-2.5 py-1 text-xs font-semibold text-forest-900">
                <Check className="size-3.5" />
                Você confirmou
            </span>
        );
    }

    if (status === "declined") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
                <X className="size-3.5" />
                Você recusou
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-950">
            <Clock className="size-3.5" />
            Responda sua presença
        </span>
    );
}

export function UpcomingMatchCard({
    match,
    groupName,
    to,
}: UpcomingMatchCardProps) {
    const { presences, isLoadingPresences, myStatus, setPresence, isPending } =
        useMatchPresence(match.groupId, match.id);
    const { weekday, day, month, time } = getMatchDateParts(
        new Date(match.matchDate),
    );
    const confirmedCount = presences?.confirmed.length ?? 0;

    return (
        <div
            className={cn(
                "flex w-full max-w-md flex-col gap-4 rounded-2xl p-5",
                CARD_BACKGROUND,
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-primary-200 uppercase">
                    Próxima partida
                </span>
                {presences && <StatusChip status={myStatus} />}
            </div>

            <Link to={to} className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <span className="text-2xl leading-none font-bold">{day}</span>
                    <span className="mt-1 text-xs leading-none font-semibold tracking-wide text-grass-400 uppercase">
                        {month}
                    </span>
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xl leading-tight font-bold">
                        {weekday} · {time}
                    </span>
                    <span className="truncate text-sm text-white/80">{groupName}</span>
                </div>
            </Link>

            <div className="flex items-center gap-2">
                {!isLoadingPresences && confirmedCount > 0 && (
                    <AvatarGroup className="*:data-[slot=avatar]:ring-forest-900">
                        {presences?.confirmed.slice(0, 4).map((member) => (
                            <Avatar key={member.id}>
                                {member.profilePicture && (
                                    <AvatarImage src={member.profilePicture} />
                                )}
                                <AvatarFallback className="bg-mint-500 font-medium text-forest-900">
                                    {getInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </AvatarGroup>
                )}
                <span className="text-sm text-white/80">
                    {presences
                        ? `${confirmedCount} confirmado${confirmedCount === 1 ? "" : "s"}`
                        : ""}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button
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
    );
}

export function NoUpcomingMatch() {
    return (
        <div
            className={cn(
                "flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center",
                CARD_BACKGROUND,
            )}
        >
            <div className="flex size-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                <Calendar className="size-6 text-grass-400" />
            </div>
            <span className="text-base font-semibold">Nenhuma partida marcada ainda</span>
            <span className="text-sm text-white/70">
                Crie uma partida em um dos seus grupos pra ela aparecer aqui
            </span>
        </div>
    );
}
