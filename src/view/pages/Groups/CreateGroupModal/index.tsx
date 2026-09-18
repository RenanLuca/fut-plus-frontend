import { Plus } from "lucide-react";
import { CurrencyInput } from "react-currency-input-field";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../../../components/ui/sheet";
import { WEEKDAY_OPTIONS } from "@/src/app/constants/weekday";
import { FREQUENCY_OPTIONS } from "@/src/app/constants/frequencyType";
import { useCreateGroupController } from "./useCreateGroupController";

export function CreateGroupModal() {
    const {
        open,
        setOpen,
        register,
        weekdayField,
        frequencyField,
        valuePerUserField,
        onSubmit,
        errors,
        isPending,
    } = useCreateGroupController();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button size="sm" />}>
                <Plus className="size-4" />
                Criar grupo
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Criar grupo</SheetTitle>
                    <SheetDescription>
                        Configure o dia, horário e frequência da sua pelada
                    </SheetDescription>
                </SheetHeader>
                <form
                    id="create-group-form"
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4 overflow-y-auto px-6"
                >
                    <div className="flex flex-col gap-1">
                        <Input
                            id="name"
                            type="text"
                            label="Nome do grupo"
                            aria-invalid={!!errors.name}
                            {...register("name")}
                        />
                        {errors.name && (
                            <span className="text-xs text-destructive">{errors.name.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600" htmlFor="weekday">
                            Dia da semana
                        </label>
                        <Select
                            value={weekdayField.value}
                            onValueChange={weekdayField.onChange}
                        >
                            <SelectTrigger id="weekday" className="w-full" aria-invalid={!!errors.weekday}>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {WEEKDAY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.weekday && (
                            <span className="text-xs text-destructive">{errors.weekday.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <Input
                            id="hour"
                            type="time"
                            label="Horário"
                            aria-invalid={!!errors.hour}
                            {...register("hour")}
                        />
                        {errors.hour && (
                            <span className="text-xs text-destructive">{errors.hour.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600" htmlFor="frequency">
                            Frequência
                        </label>
                        <Select
                            value={frequencyField.value}
                            onValueChange={frequencyField.onChange}
                        >
                            <SelectTrigger id="frequency" className="w-full" aria-invalid={!!errors.frequency}>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {FREQUENCY_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.frequency && (
                            <span className="text-xs text-destructive">{errors.frequency.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-600" htmlFor="valuePerUser">
                            Valor por pessoa
                        </label>
                        <CurrencyInput
                            id="valuePerUser"
                            customInput={Input}
                            placeholder="R$ 0,00"
                            intlConfig={{ locale: "pt-BR", currency: "BRL" }}
                            decimalsLimit={2}
                            value={valuePerUserField.value}
                            onValueChange={(value) =>
                                valuePerUserField.onChange(value ?? "")
                            }
                            aria-invalid={!!errors.valuePerUser}
                        />
                        {errors.valuePerUser && (
                            <span className="text-xs text-destructive">
                                {errors.valuePerUser.message}
                            </span>
                        )}
                    </div>
                </form>
                <SheetFooter className="flex-row">
                    <SheetClose render={<Button variant="outline" className="flex-1" />}>
                        Cancelar
                    </SheetClose>
                    <Button
                        type="submit"
                        form="create-group-form"
                        disabled={isPending}
                        className="flex-1"
                    >
                        {isPending ? "Criando..." : "Criar"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
