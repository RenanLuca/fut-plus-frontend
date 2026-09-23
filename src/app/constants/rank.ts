import { Crown, Medal, Trophy, type LucideIcon } from "lucide-react";

export type Rank = "BRASILEIRAO" | "CHAMPIONS_LEAGUE" | "BALLON_DOR";

export const RANK_OPTIONS: {
  value: Rank;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
}[] = [
  {
    value: "BRASILEIRAO",
    label: "Brasileirão",
    icon: Trophy,
    iconClassName: "text-orange-700 dark:text-orange-400",
  },
  {
    value: "CHAMPIONS_LEAGUE",
    label: "Champions League",
    icon: Medal,
    iconClassName: "text-slate-400 dark:text-slate-300",
  },
  {
    value: "BALLON_DOR",
    label: "Bola de Ouro",
    icon: Crown,
    iconClassName: "text-yellow-500 dark:text-yellow-400",
  },
];

export const RANK_OPTIONS_BY_VALUE = Object.fromEntries(
  RANK_OPTIONS.map((option) => [option.value, option]),
) as Record<Rank, (typeof RANK_OPTIONS)[number]>;
