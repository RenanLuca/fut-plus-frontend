import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import {
    formatMonthLong,
    isSameMonth,
    shiftMonth,
    type YearMonth,
} from "@/src/app/utils/brazil-month";

export function MonthSelector({
    value,
    max,
    onChange,
}: {
    value: YearMonth;
    max: YearMonth;
    onChange: (value: YearMonth) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-2">
            <Button
                size="icon-sm"
                variant="outline"
                aria-label="Mês anterior"
                onClick={() => onChange(shiftMonth(value, -1))}
            >
                <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium text-medium first-letter:uppercase">
                {formatMonthLong(value)}
            </span>
            <Button
                size="icon-sm"
                variant="outline"
                aria-label="Próximo mês"
                disabled={isSameMonth(value, max)}
                onClick={() => onChange(shiftMonth(value, 1))}
            >
                <ChevronRight className="size-4" />
            </Button>
        </div>
    );
}
