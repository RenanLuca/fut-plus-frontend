import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../../../../components/ui/radio-group";
import {
    SheetClose,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "../../../../components/ui/sheet";
import { POSITION_OPTIONS } from "@/src/app/constants/position";
import { RANK_OPTIONS } from "@/src/app/constants/rank";
import { useAddGuestController } from "./useAddGuestController";

export function AddGuestForm({
    groupId,
    matchId,
    onAdded,
}: {
    groupId: string;
    matchId: string;
    onAdded: () => void;
}) {
    const { register, positionField, rankField, onSubmit, errors, isPending } =
        useAddGuestController(groupId, matchId, onAdded);

    return (
        <>
            <SheetHeader>
                <SheetTitle>Adicionar convidado</SheetTitle>
                <SheetDescription>
                    O convidado entra já confirmado só nesta partida
                </SheetDescription>
            </SheetHeader>
            <form
                id="add-guest-form"
                onSubmit={onSubmit}
                className="flex flex-col gap-4 overflow-y-auto px-6"
            >
                <div className="flex flex-col gap-1">
                    <Input
                        id="guest-name"
                        type="text"
                        label="Nome"
                        aria-invalid={!!errors.name}
                        {...register("name")}
                    />
                    {errors.name && (
                        <span className="text-xs text-destructive">{errors.name.message}</span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-strong">Posição</span>
                    <RadioGroup
                        aria-invalid={!!errors.position}
                        value={positionField.value}
                        onValueChange={positionField.onChange}
                    >
                        {POSITION_OPTIONS.map((option) => (
                            <RadioGroupItem
                                key={option.value}
                                value={option.value}
                                icon={option.icon}
                            >
                                {option.label}
                            </RadioGroupItem>
                        ))}
                    </RadioGroup>
                    {errors.position && (
                        <span className="text-xs text-destructive">{errors.position.message}</span>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-strong">Nível</span>
                    <RadioGroup
                        aria-invalid={!!errors.rank}
                        value={rankField.value}
                        onValueChange={rankField.onChange}
                    >
                        {RANK_OPTIONS.map((option) => (
                            <RadioGroupItem
                                key={option.value}
                                value={option.value}
                                icon={option.icon}
                                iconClassName={option.iconClassName}
                            >
                                {option.label}
                            </RadioGroupItem>
                        ))}
                    </RadioGroup>
                    {errors.rank && (
                        <span className="text-xs text-destructive">{errors.rank.message}</span>
                    )}
                </div>
            </form>
            <SheetFooter className="flex-row">
                <SheetClose render={<Button variant="outline" className="flex-1" />}>
                    Cancelar
                </SheetClose>
                <Button
                    type="submit"
                    form="add-guest-form"
                    disabled={isPending}
                    className="flex-1"
                >
                    {isPending ? "Adicionando..." : "Adicionar"}
                </Button>
            </SheetFooter>
        </>
    );
}
