import { Users } from "lucide-react";
import { WEEKDAY_LABELS } from "@/src/app/constants/weekday";
import { FREQUENCY_LABELS } from "@/src/app/constants/frequencyType";
import type { Group } from "@/src/app/services/groupsService";
import { CreateGroupSheet } from "../Groups/CreateGroupSheet";
import { useHomeController } from "./useHomeController";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function GroupCard({ group }: { group: Group }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-2 border-l-4 border-l-primary-500">
            <span className="font-semibold text-primary-900">{group.name}</span>
            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                <span className="rounded-full bg-pale-100 px-2 py-0.5">
                    {WEEKDAY_LABELS[group.weekday]}, {group.hour}
                </span>
                <span className="rounded-full bg-pale-100 px-2 py-0.5">
                    {FREQUENCY_LABELS[group.frequency]}
                </span>
            </div>
            <span className="text-sm text-muted-foreground">
                {currencyFormatter.format(group.valuePerUser)} por pessoa
            </span>
        </div>
    );
}

export function HomePage() {
    const { user, groups, isLoadingGroups } = useHomeController();
    const firstName = user?.name.split(" ")[0];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-xl font-bold text-primary-900">
                {firstName ? `Olá, ${firstName}!` : "Olá!"}
            </h1>

            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">Meus grupos</h2>
                    <CreateGroupSheet />
                </div>

                {isLoadingGroups && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((key) => (
                            <div
                                key={key}
                                className="h-24 animate-pulse rounded-xl bg-gray-100"
                            />
                        ))}
                    </div>
                )}

                {!isLoadingGroups && groups.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center">
                        <Users className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-gray-700">
                            Você ainda não faz parte de nenhum grupo
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Crie um grupo pra começar a organizar suas peladas
                        </p>
                    </div>
                )}

                {!isLoadingGroups && groups.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
