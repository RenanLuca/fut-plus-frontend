export type GroupMemberType = "MONTHLY" | "DAILY" | "OWNER";

export const GROUP_MEMBER_TYPE_LABELS: Record<GroupMemberType, string> = {
  MONTHLY: "Mensalista",
  DAILY: "Diarista",
  OWNER: "Dono",
};
