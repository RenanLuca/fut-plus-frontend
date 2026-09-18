import { Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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
import { useCreateMatchController } from "./useCreateMatchController";

export function CreateMatchModal({ groupId }: { groupId: string }) {
    const { open, onOpenChange, register, onSubmit, errors, isPending } =
        useCreateMatchController(groupId);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger render={<Button size="sm" />}>
                <Plus className="size-4" />
                Criar partida
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Criar partida</SheetTitle>
                    <SheetDescription>
                        Escolha a data e o horário da partida
                    </SheetDescription>
                </SheetHeader>
                <form
                    id="create-match-form"
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4 px-6"
                >
                    <div className="flex flex-col gap-1">
                        <Input
                            id="matchDate"
                            type="datetime-local"
                            label="Data e horário"
                            aria-invalid={!!errors.matchDate}
                            {...register("matchDate")}
                        />
                        {errors.matchDate && (
                            <span className="text-xs text-destructive">
                                {errors.matchDate.message}
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
                        form="create-match-form"
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
