import { NavLink, Outlet } from "react-router";
import { PageWrapper } from "../../components/PageWrapper";
import { WEEKDAY_LABELS } from "@/src/app/constants/weekday";
import { FREQUENCY_LABELS } from "@/src/app/constants/frequencyType";
import { cn } from "@/src/app/utils/cn";
import { GroupActionsMenu } from "./GroupActionsMenu";
import { useGroupLayoutController } from "./useGroupLayoutController";

export function GroupLayout() {
    const { group, isLoadingGroup, membersCount, isOwner } =
        useGroupLayoutController();

    if (isLoadingGroup || !group) {
        return (
            <PageWrapper>
                <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
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
    ];

    return (
        <PageWrapper
            title={
                <>
                    <h1 className="text-xl font-bold text-primary-900">{group.name}</h1>
                    <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                        <span className="rounded-full bg-pale-100 px-2 py-0.5">
                            {WEEKDAY_LABELS[group.weekday]}, {group.hour}
                        </span>
                        <span className="rounded-full bg-pale-100 px-2 py-0.5">
                            {FREQUENCY_LABELS[group.frequency]}
                        </span>
                    </div>
                </>
            }
            actions={<GroupActionsMenu group={group} isOwner={isOwner} />}
        >
            <nav className="-mt-2 flex gap-1 overflow-x-auto border-b border-gray-100">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.end}
                        className={({ isActive }) =>
                            cn(
                                "-mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary-900",
                                isActive && "border-primary-500 text-primary-900",
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
