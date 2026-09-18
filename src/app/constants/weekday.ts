export type Weekday =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Segunda",
  TUESDAY: "Terça",
  WEDNESDAY: "Quarta",
  THURSDAY: "Quinta",
  FRIDAY: "Sexta",
  SATURDAY: "Sábado",
};

export const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = [
  { value: "SUNDAY", label: WEEKDAY_LABELS.SUNDAY },
  { value: "MONDAY", label: WEEKDAY_LABELS.MONDAY },
  { value: "TUESDAY", label: WEEKDAY_LABELS.TUESDAY },
  { value: "WEDNESDAY", label: WEEKDAY_LABELS.WEDNESDAY },
  { value: "THURSDAY", label: WEEKDAY_LABELS.THURSDAY },
  { value: "FRIDAY", label: WEEKDAY_LABELS.FRIDAY },
  { value: "SATURDAY", label: WEEKDAY_LABELS.SATURDAY },
];
