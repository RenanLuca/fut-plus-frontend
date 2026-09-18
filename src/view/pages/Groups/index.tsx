import { PageWrapper } from "../../components/PageWrapper";
import { GroupFormModal } from "./GroupFormModal";
import { GroupsGrid } from "./GroupsGrid";
import { useGroupsController } from "./useGroupsController";

export function GroupsPage() {
    const { groups, isLoading } = useGroupsController();

    return (
        <PageWrapper title="Meus grupos" actions={<GroupFormModal mode="create" />}>
            <GroupsGrid groups={groups} isLoading={isLoading} />
        </PageWrapper>
    );
}
