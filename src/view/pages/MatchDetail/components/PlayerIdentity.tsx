import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../components/ui/avatar";
import {
    POSITION_OPTIONS_BY_VALUE,
    type Position,
} from "@/src/app/constants/position";
import { RANK_OPTIONS_BY_VALUE, type Rank } from "@/src/app/constants/rank";
import { cn } from "@/src/app/utils/cn";
import { getInitials } from "@/src/app/utils/get-initials";

export function PlayerIdentity({
    name,
    profilePicture,
    isGuest,
    position,
    rank,
}: {
    name: string;
    profilePicture: string | null;
    isGuest: boolean;
    position: Position;
    rank?: Rank | null;
}) {
    const positionOption = POSITION_OPTIONS_BY_VALUE[position];
    const rankOption = rank ? RANK_OPTIONS_BY_VALUE[rank] : null;

    return (
        <span className="flex items-center gap-2">
            <Avatar size="sm">
                {profilePicture && <AvatarImage src={profilePicture} />}
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <span className="flex flex-col text-left">
                <span className="flex items-center gap-1 text-sm">
                    <positionOption.icon className="size-3.5 shrink-0 text-muted-foreground" />
                    {rankOption && (
                        <rankOption.icon
                            className={cn("size-3.5 shrink-0", rankOption.iconClassName)}
                        />
                    )}
                    {name}
                </span>
                {isGuest && (
                    <span className="text-xs text-muted-foreground">Convidado</span>
                )}
            </span>
        </span>
    );
}
