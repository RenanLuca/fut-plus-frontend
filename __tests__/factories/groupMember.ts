import type { GroupMember } from "@/src/app/services/groupMembersService";

export function makeGroupMemberMock({
  name = "Carlos",
  ...overrides
}: Partial<GroupMember> & { name?: string } = {}): GroupMember {
  const userId = overrides.userId ?? "user-2";
  return {
    id: `member-${userId}`,
    groupId: "group-1",
    userId,
    type: "MONTHLY",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: userId,
      name,
      profilePicture: null,
      position: "DEFENDER",
    },
    ...overrides,
  };
}
