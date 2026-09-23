import { Shuffle } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../../../../components/ui/sheet";
import { useGenerateTeamsController } from "./useGenerateTeamsController";

export function GenerateTeamsModal({
    groupId,
    matchId,
    hasTeams,
    confirmedOutfieldCount,
}: {
    groupId: string;
    matchId: string;
    hasTeams: boolean;
    confirmedOutfieldCount: number;
}) {
    const {
        open,
        onOpenChange,
        register,
        onSubmit,
        errors,
        isPending,
        estimatedTeamCount,
        isImpossible,
    } = useGenerateTeamsController(groupId, matchId, confirmedOutfieldCount);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger render={<Button size="sm" variant={hasTeams ? "outline" : "default"} />}>
                <Shuffle className="size-4" />
                {hasTeams ? "Gerar novamente" : "Gerar times"}
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Gerar times</SheetTitle>
                    <SheetDescription>
                        {hasTeams
                            ? "Isso substitui os times atuais, sorteando de novo entre os confirmados"
                            : "Distribui os jogadores confirmados em times balanceados"}
                    </SheetDescription>
                </SheetHeader>
                <form
                    id="generate-teams-form"
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4 px-6"
                >
                    <div className="flex flex-col gap-1">
                        <Input
                            id="playersPerTeam"
                            type="number"
                            min="1"
                            label="Jogadores por time"
                            aria-invalid={!!errors.playersPerTeam}
                            {...register("playersPerTeam")}
                        />
                        <span className="text-xs text-muted-foreground">
                            Goleiros não entram nessa conta — são distribuídos 1
                            por time, mesmo que sobre ou falte algum
                        </span>
                        {errors.playersPerTeam && (
                            <span className="text-xs text-destructive">
                                {errors.playersPerTeam.message}
                            </span>
                        )}
                        {!errors.playersPerTeam && estimatedTeamCount > 0 && (
                            <span
                                className={
                                    isImpossible
                                        ? "text-xs text-destructive"
                                        : "text-xs text-muted-foreground"
                                }
                            >
                                {isImpossible
                                    ? "Impossível gerar 2 times com esse número"
                                    : `Isso vai gerar: ${estimatedTeamCount} times`}
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
                        form="generate-teams-form"
                        disabled={isPending || isImpossible}
                        className="flex-1"
                    >
                        {isPending ? "Gerando..." : "Gerar"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
