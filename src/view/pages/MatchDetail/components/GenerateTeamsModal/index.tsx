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
    confirmedCount,
}: {
    groupId: string;
    matchId: string;
    hasTeams: boolean;
    confirmedCount: number;
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
        impossibleMessage,
    } = useGenerateTeamsController(groupId, matchId, confirmedCount);

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
                        {errors.playersPerTeam && (
                            <span className="text-xs text-destructive">
                                {errors.playersPerTeam.message}
                            </span>
                        )}
                        {!errors.playersPerTeam && isImpossible && (
                            <span className="text-xs text-destructive">
                                {impossibleMessage}
                            </span>
                        )}
                        {!errors.playersPerTeam &&
                            !isImpossible &&
                            estimatedTeamCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    Isso vai gerar: {estimatedTeamCount} times
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
