import { LogOut } from "lucide-react";
import { PageWrapper } from "../../components/PageWrapper";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { getInitials } from "@/src/app/utils/get-initials";
import { ProfileForm } from "./ProfileForm";
import { useProfileController } from "./useProfileController";

export function ProfilePage() {
    const { user, isLoading, logout } = useProfileController();

    if (isLoading || !user) {
        return (
            <PageWrapper title="Perfil">
                <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper title="Perfil">
            <div className="mx-auto flex w-full max-w-md flex-col gap-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <Avatar size="lg">
                        {user.profilePicture && <AvatarImage src={user.profilePicture} />}
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-lg font-semibold text-primary-900">
                        {user.name}
                    </span>
                </div>

                <ProfileForm user={user} />

                <Button variant="outline" className="w-full" onClick={() => logout()}>
                    <LogOut className="size-4" />
                    Sair da conta
                </Button>
            </div>
        </PageWrapper>
    );
}
