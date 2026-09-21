export type Rank = "BRASILEIRAO" | "CHAMPIONS_LEAGUE" | "BALLON_DOR";

export const RANK_OPTIONS: { value: Rank; label: string }[] = [
  { value: "BRASILEIRAO", label: "Brasileirão" },
  { value: "CHAMPIONS_LEAGUE", label: "Champions League" },
  { value: "BALLON_DOR", label: "Bola de Ouro" },
];
