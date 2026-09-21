import { cn } from "@/src/app/utils/cn";
import { getMatchDateParts } from "@/src/app/utils/format-match-date";

export function MatchDateBlock({
    date,
    variant = "dark",
}: {
    date: Date;
    variant?: "dark" | "solid";
}) {
    const { day, month } = getMatchDateParts(date);

    return (
        <div
            className={cn(
                "flex size-16 shrink-0 flex-col items-center justify-center rounded-xl text-white",
                variant === "dark"
                    ? "bg-white/10 ring-1 ring-white/20"
                    : "bg-primary-900",
            )}
        >
            <span className="text-2xl leading-none font-bold">{day}</span>
            <span className="mt-1 text-xs leading-none font-semibold tracking-wide text-grass-400 uppercase">
                {month}
            </span>
        </div>
    );
}
