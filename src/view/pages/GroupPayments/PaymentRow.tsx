import { ExternalLink, Receipt } from "lucide-react";
import { formatCurrency } from "@/src/app/utils/format-currency";

export function PaymentRow({
    title,
    subtitle,
    receipt,
    amount,
}: {
    title: string;
    subtitle: string;
    receipt: string | null;
    amount: number;
}) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
            <Receipt className="size-4 shrink-0 text-primary-900" />
            <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{title}</span>
                <span className="text-xs text-muted-foreground">{subtitle}</span>
            </div>
            {receipt && (
                <a
                    href={receipt}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-900 underline-offset-2 hover:underline"
                >
                    Comprovante
                    <ExternalLink className="size-3" />
                </a>
            )}
            <span className="text-sm font-semibold">{formatCurrency(amount)}</span>
        </div>
    );
}
