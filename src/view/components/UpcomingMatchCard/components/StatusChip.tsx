import type { MyPresenceStatus } from "@/src/app/hooks/useMatchPresence";
import { Check, Clock, X } from "lucide-react";

export function StatusChip({ status }: { status: MyPresenceStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-grass-500 px-2.5 py-1 text-xs font-semibold text-forest-900">
        <Check className="size-3.5" />
        Você confirmou
      </span>
    );
  }

  if (status === "declined") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white">
        <X className="size-3.5" />
        Você recusou
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-950">
      <Clock className="size-3.5" />
      Responda sua presença
    </span>
  );
}
