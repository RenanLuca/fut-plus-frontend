import { httpClient } from "@/src/app/lib/http-client";
import type { GroupMemberType } from "@/src/app/constants/groupMemberType";
import type { Position } from "@/src/app/constants/position";

type MemberUser = {
  id: string;
  name: string;
  profilePicture: string | null;
  position: Position;
};

type MemberGuestUser = {
  id: string;
  name: string;
  position: Position;
};

export type GroupMember = {
  id: string;
  groupId: string;
  userId: string | null;
  guestUserId: string | null;
  type: GroupMemberType;
  createdAt: string;
  updatedAt: string;
  user: MemberUser | null;
  guestUser: MemberGuestUser | null;
};

export async function findAllPerGroup(
  groupId: string,
): Promise<GroupMember[]> {
  const { data } = await httpClient.get<GroupMember[]>(
    `/groups/${groupId}/group-members`,
  );
  return data;
}
