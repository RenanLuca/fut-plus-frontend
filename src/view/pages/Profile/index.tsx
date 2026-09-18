import { PageWrapper } from "../../components/PageWrapper";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { POSITION_OPTIONS } from "@/src/app/constants/position";
import { useCurrentUser } from "@/src/app/hooks/useCurrentUser";
import { getInitials } from "@/src/app/utils/get-initials";

export function ProfilePage() {
    const { data: user, isLoading } = useCurrentUser();

    if (isLoading || !user) {
        return (
            <PageWrapper title="Perfil">
                <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            </PageWrapper>
        );
    }

    const position = POSITION_OPTIONS.find(
        (option) => option.value === user.position,
    );

    return (
        <PageWrapper title="Perfil">
            <div className="flex flex-col items-center gap-4 py-6">
                <Avatar size="lg">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-lg font-semibold text-primary-900">{user.name}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                {position && (
                    <span className="flex items-center gap-1.5 rounded-full bg-pale-100 px-3 py-1 text-xs font-medium text-primary-900">
                        <position.icon className="size-3.5" />
                        {position.label}
                    </span>
                )}
            </div>
        </PageWrapper>
    );
}
