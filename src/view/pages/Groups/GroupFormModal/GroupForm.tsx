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
    SheetClose,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "../../../components/ui/sheet";
import { WEEKDAY_OPTIONS } from "@/src/app/constants/weekday";
import { FREQUENCY_OPTIONS } from "@/src/app/constants/frequencyType";
import {
    useGroupFormController,
    type GroupFormMode,
} from "./useGroupFormController";

type GroupFormProps = GroupFormMode & { onSaved: () => void };

export function GroupForm({ onSaved, ...mode }: GroupFormProps) {
    const {
        register,
        weekdayField,
        frequencyField,
        valuePerUserField,
        onSubmit,
        errors,
        isPending,
    } = useGroupFormController(mode, onSaved);

    const isEdit = mode.mode === "edit";

    return (
        <>
            <SheetHeader>
                <SheetTitle>{isEdit ? "Editar grupo" : "Criar grupo"}</SheetTitle>
                <SheetDescription>
                    Configure o dia, horário e frequência da sua pelada
                </SheetDescription>
            </SheetHeader>
            <form
                id="group-form"
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
                    <label className="text-xs text-gray-800" htmlFor="weekday">
                        Dia da semana
                    </label>
                    <Select
                        items={WEEKDAY_OPTIONS}
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
                    <label className="text-xs text-gray-800" htmlFor="frequency">
                        Frequência
                    </label>
                    <Select
                        items={FREQUENCY_OPTIONS}
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
                    <label className="text-xs text-gray-800" htmlFor="valuePerUser">
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
                    form="group-form"
                    disabled={isPending}
                    className="flex-1"
                >
                    {isPending
                        ? isEdit
                            ? "Salvando..."
                            : "Criando..."
                        : isEdit
                            ? "Salvar"
                            : "Criar"}
                </Button>
            </SheetFooter>
        </>
    );
}
