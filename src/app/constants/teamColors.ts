export const TEAM_COLOR_OPTIONS = [
  { value: "#FFFFFF", label: "Branco" },
  { value: "#000000", label: "Preto" },
  { value: "#FF0000", label: "Vermelho" },
  { value: "#0000FF", label: "Azul" },
  { value: "#FFFF00", label: "Amarelo" },
  { value: "#00FF00", label: "Verde" },
] as const;

export type TeamColor = (typeof TEAM_COLOR_OPTIONS)[number]["value"];

export const TEAM_COLOR_VALUES = TEAM_COLOR_OPTIONS.map(
  (option) => option.value,
) as [TeamColor, ...TeamColor[]];
