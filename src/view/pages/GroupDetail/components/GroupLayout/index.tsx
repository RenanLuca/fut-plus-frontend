import { NavLink, Outlet } from "react-router";
import { PageWrapper } from "../../../../components/PageWrapper";
import { WEEKDAY_LABELS } from "@/src/app/constants/weekday";
import { FREQUENCY_LABELS } from "@/src/app/constants/frequencyType";
import { cn } from "@/src/app/utils/cn";
import { GroupActionsMenu } from "../GroupActionsMenu";
import { useGroupLayoutController } from "./useGroupLayoutController";

export function GroupLayout() {
    const { group, isLoadingGroup, membersCount, isOwner } =
        useGroupLayoutController();

    if (isLoadingGroup || !group) {
        return (
            <PageWrapper>
                <div className="h-24 animate-pulse rounded-xl bg-soft-strong" />
            </PageWrapper>
        );
    }

    const tabs = [
        { to: `/groups/${group.id}`, label: "Partida atual", end: true },
        {
            to: `/groups/${group.id}/members`,
            label: membersCount === undefined ? "Membros" : `Membros (${membersCount})`,
            end: false,
        },
        { to: `/groups/${group.id}/payments`, label: "Pagamentos", end: false },
    ];

    return (
        <PageWrapper
            title={
                <>
                    <h1 className="text-xl font-bold text-heading">{group.name}</h1>
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded-full bg-soft px-2 py-0.5 text-strong">
                            {WEEKDAY_LABELS[group.weekday]}, {group.hour}
                        </span>
                        <span className="rounded-full bg-soft px-2 py-0.5 text-strong">
                            {FREQUENCY_LABELS[group.frequency]}
                        </span>
                    </div>
                </>
            }
            actions={<GroupActionsMenu group={group} isOwner={isOwner} />}
        >
            <nav className="-mt-2 flex gap-1 overflow-x-auto shadow-[inset_0_-1px_0_0_var(--color-frame)]">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.end}
                        className={({ isActive }) =>
                            cn(
                                "whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-medium transition-colors hover:text-heading",
                                isActive && "border-primary-500 text-heading",
                            )
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>
            <Outlet />
        </PageWrapper>
    );
}
