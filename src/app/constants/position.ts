import { Hand, Shield, Target, Wind, type LucideIcon } from "lucide-react";

export type Position = "GOALKEEPER" | "DEFENDER" | "WINGER" | "STRIKER";

export const POSITION_OPTIONS: {
  value: Position;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "GOALKEEPER", label: "Goleiro", icon: Hand },
  { value: "DEFENDER", label: "Zagueiro", icon: Shield },
  { value: "WINGER", label: "Ponta", icon: Wind },
  { value: "STRIKER", label: "Atacante", icon: Target },
];
