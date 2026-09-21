import { Users } from "lucide-react";
import type { Group } from "@/src/app/services/groupsService";
import { GroupCard } from "./GroupCard";

export function GroupsGrid({
    groups,
    isLoading,
}: {
    groups: Group[];
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((key) => (
                    <div
                        key={key}
                        className="h-24 animate-pulse rounded-xl bg-soft"
                    />
                ))}
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface py-10 text-center">
                <Users className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-gray-700">
                    Você ainda não faz parte de nenhum grupo
                </p>
                <p className="text-xs text-muted-foreground">
                    Crie um grupo pra começar a organizar suas peladas
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
            ))}
        </div>
    );
}
