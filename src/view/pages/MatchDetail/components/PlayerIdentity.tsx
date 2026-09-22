import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../components/ui/avatar";
import { getInitials } from "@/src/app/utils/get-initials";

export function PlayerIdentity({
    name,
    profilePicture,
    isGuest,
}: {
    name: string;
    profilePicture: string | null;
    isGuest: boolean;
}) {
    return (
        <span className="flex items-center gap-2">
            <Avatar size="sm">
                {profilePicture && <AvatarImage src={profilePicture} />}
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <span className="flex flex-col text-left">
                <span className="text-sm">{name}</span>
                {isGuest && (
                    <span className="text-xs text-muted-foreground">Convidado</span>
                )}
            </span>
        </span>
    );
}
