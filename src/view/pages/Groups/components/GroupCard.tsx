import { Link } from "react-router";
import { WEEKDAY_LABELS } from "@/src/app/constants/weekday";
import { FREQUENCY_LABELS } from "@/src/app/constants/frequencyType";
import type { Group } from "@/src/app/services/groupsService";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function GroupCard({ group }: { group: Group }) {
    return (
        <Link
            to={`/groups/${group.id}`}
            className="rounded-xl border border-line bg-surface p-4 shadow-sm flex flex-col gap-2 border-l-4 border-l-primary-500 transition-shadow hover:shadow-md"
        >
            <span className="font-semibold text-heading">{group.name}</span>
            <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                <span className="rounded-full bg-soft px-2 py-0.5 text-strong">
                    {WEEKDAY_LABELS[group.weekday]}, {group.hour}
                </span>
                <span className="rounded-full bg-soft px-2 py-0.5 text-strong">
                    {FREQUENCY_LABELS[group.frequency]}
                </span>
            </div>
            <span className="text-sm text-muted-foreground">
                {currencyFormatter.format(group.valuePerUser)} por pessoa
            </span>
        </Link>
    );
}
