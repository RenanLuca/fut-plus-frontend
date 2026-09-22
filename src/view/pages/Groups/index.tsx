import { PageWrapper } from "../../components/PageWrapper";
import { GroupFormModal } from "./components/GroupFormModal";
import { GroupsGrid } from "./components/GroupsGrid";
import { useGroupsController } from "./useGroupsController";

export function GroupsPage() {
    const { groups, isLoading } = useGroupsController();

    return (
        <PageWrapper title="Meus grupos" actions={<GroupFormModal mode="create" />}>
            <GroupsGrid groups={groups} isLoading={isLoading} />
        </PageWrapper>
    );
}
