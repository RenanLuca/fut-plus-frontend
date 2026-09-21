export type GroupMemberType = "MONTHLY" | "DAILY" | "OWNER";

export const GROUP_MEMBER_TYPE_LABELS: Record<GroupMemberType, string> = {
  MONTHLY: "Mensalista",
  DAILY: "Diarista",
  OWNER: "Dono",
};

export const JOINABLE_MEMBER_TYPE_OPTIONS: {
  value: Exclude<GroupMemberType, "OWNER">;
  label: string;
}[] = [
  { value: "MONTHLY", label: GROUP_MEMBER_TYPE_LABELS.MONTHLY },
  { value: "DAILY", label: GROUP_MEMBER_TYPE_LABELS.DAILY },
];
