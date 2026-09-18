import { GroupFormModal } from "./GroupFormModal";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupsController } from "./useGroupsController";

export function GroupsPage() {
    const { groups, isLoading } = useGroupsController();

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary-900">Meus grupos</h1>
                <GroupFormModal mode="create" />
            </div>
            <GroupsGrid groups={groups} isLoading={isLoading} />
        </div>
    );
}
