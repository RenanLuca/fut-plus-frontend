import { GroupFormModal } from "../Groups/GroupFormModal";
import { GroupsGrid } from "../Groups/GroupsGrid";
import { useHomeController } from "./useHomeController";

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
                    <GroupFormModal mode="create" />
                </div>
                <GroupsGrid groups={groups} isLoading={isLoadingGroups} />
            </section>
        </div>
    );
}
