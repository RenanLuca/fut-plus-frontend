export type FrequencyType = "EVENTUAL" | "MONTHLY";

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  EVENTUAL: "Eventual",
  MONTHLY: "Mensal",
};

export const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: "EVENTUAL", label: FREQUENCY_LABELS.EVENTUAL },
  { value: "MONTHLY", label: FREQUENCY_LABELS.MONTHLY },
];
