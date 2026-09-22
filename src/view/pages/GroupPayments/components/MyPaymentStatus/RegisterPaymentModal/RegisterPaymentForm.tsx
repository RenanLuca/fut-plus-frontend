import { CurrencyInput } from "react-currency-input-field";
import { ConfirmDialog } from "../../../../../components/ConfirmDialog";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../../components/ui/select";
import {
    SheetClose,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "../../../../../components/ui/sheet";
import { formatCurrency } from "@/src/app/utils/format-currency";
import { useRegisterPaymentController } from "./useRegisterPaymentController";

export function RegisterPaymentForm({
    groupId,
    isDaily,
    monthName,
    onRegistered,
}: {
    groupId: string;
    isDaily: boolean;
    monthName: string;
    onRegistered: () => void;
}) {
    const {
        register,
        amountField,
        matchField,
        matchOptions,
        onSubmit,
        errors,
        valuesToConfirm,
        cancelConfirmation,
        confirmRegistration,
        isPending,
    } = useRegisterPaymentController(groupId, isDaily, onRegistered);

    return (
        <>
            <SheetHeader>
                <SheetTitle>Registrar pagamento</SheetTitle>
                <SheetDescription>
                    {isDaily
                        ? "Pagamento por partida"
                        : `Mensalidade de ${monthName}`}
                </SheetDescription>
            </SheetHeader>
            <form
                id="register-payment-form"
                onSubmit={onSubmit}
                className="flex flex-col gap-4 overflow-y-auto px-6"
            >
                {isDaily && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-strong" htmlFor="payment-match">
                            Partida
                        </label>
                        <Select
                            items={matchOptions}
                            value={matchField.value}
                            onValueChange={matchField.onChange}
                        >
                            <SelectTrigger
                                id="payment-match"
                                className="w-full"
                                aria-invalid={!!errors.matchId}
                            >
                                <SelectValue placeholder="Selecione a partida" />
                            </SelectTrigger>
                            <SelectContent>
                                {matchOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.matchId && (
                            <span className="text-xs text-destructive">
                                {errors.matchId.message}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-strong" htmlFor="payment-amount">
                        Valor pago
                    </label>
                    <CurrencyInput
                        id="payment-amount"
                        customInput={Input}
                        placeholder="R$ 0,00"
                        intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                        decimalsLimit={2}
                        value={amountField.value}
                        onValueChange={(value) => amountField.onChange(value ?? "")}
                        aria-invalid={!!errors.amount}
                    />
                    {errors.amount && (
                        <span className="text-xs text-destructive">{errors.amount.message}</span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <Input
                        id="payment-receipt"
                        type="text"
                        inputMode="url"
                        label="Link do comprovante (opcional)"
                        placeholder="https://..."
                        aria-invalid={!!errors.receipt}
                        {...register("receipt")}
                    />
                    {errors.receipt && (
                        <span className="text-xs text-destructive">{errors.receipt.message}</span>
                    )}
                </div>
            </form>
            <SheetFooter className="flex-row">
                <SheetClose render={<Button variant="outline" className="flex-1" />}>
                    Cancelar
                </SheetClose>
                <Button type="submit" form="register-payment-form" className="flex-1">
                    Registrar
                </Button>
            </SheetFooter>

            <ConfirmDialog
                open={valuesToConfirm !== null}
                onOpenChange={(open) => !open && cancelConfirmation()}
                title="Registrar pagamento?"
                description={`Você está declarando o pagamento de ${formatCurrency(Number(valuesToConfirm?.amount ?? 0))}. Essa declaração não pode ser desfeita.`}
                confirmLabel="Registrar"
                confirmVariant="default"
                isPending={isPending}
                onConfirm={confirmRegistration}
            />
        </>
    );
}
