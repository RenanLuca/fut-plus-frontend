import { Users } from "lucide-react";

export function GroupsPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-gray-700">Em breve</p>
            <p className="text-xs text-muted-foreground">
                A gestão de grupos ainda está sendo construída
            </p>
        </div>
    );
}
