export type GroupMemberType = "MONTHLY" | "DAILY" | "GUEST" | "OWNER";

export const GROUP_MEMBER_TYPE_LABELS: Record<GroupMemberType, string> = {
  MONTHLY: "Mensalista",
  DAILY: "Diarista",
  GUEST: "Convidado",
  OWNER: "Dono",
};
