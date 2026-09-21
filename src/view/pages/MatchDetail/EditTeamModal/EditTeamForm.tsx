import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    SheetClose,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "../../../components/ui/sheet";
import { TEAM_COLOR_OPTIONS } from "@/src/app/constants/teamColors";
import type { MatchTeam } from "@/src/app/services/matchTeamsService";
import { cn } from "@/src/app/utils/cn";
import { useEditTeamController } from "./useEditTeamController";

export function EditTeamForm({
    groupId,
    matchId,
    team,
    onSaved,
}: {
    groupId: string;
    matchId: string;
    team: MatchTeam;
    onSaved: () => void;
}) {
    const { register, colorField, onSubmit, errors, isPending } =
        useEditTeamController(groupId, matchId, team, onSaved);

    return (
        <>
            <SheetHeader>
                <SheetTitle>Editar time</SheetTitle>
                <SheetDescription>Nome e cor da camisa</SheetDescription>
            </SheetHeader>
            <form
                id="edit-team-form"
                onSubmit={onSubmit}
                className="flex flex-col gap-4 px-6"
            >
                <div className="flex flex-col gap-1">
                    <Input
                        id="team-name"
                        type="text"
                        label="Nome"
                        aria-invalid={!!errors.name}
                        {...register("name")}
                    />
                    {errors.name && (
                        <span className="text-xs text-destructive">{errors.name.message}</span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-xs text-gray-800">Cor</span>
                    <div role="radiogroup" aria-label="Cor do time" className="flex flex-wrap gap-3">
                        {TEAM_COLOR_OPTIONS.map((option) => {
                            const selected = colorField.value === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    aria-label={option.label}
                                    title={option.label}
                                    onClick={() => colorField.onChange(option.value)}
                                    style={{ backgroundColor: option.value }}
                                    className={cn(
                                        "size-9 rounded-full border border-gray-300 transition-shadow",
                                        selected && "ring-2 ring-primary-500 ring-offset-2",
                                    )}
                                />
                            );
                        })}
                    </div>
                    {errors.color && (
                        <span className="text-xs text-destructive">{errors.color.message}</span>
                    )}
                </div>
            </form>
            <SheetFooter className="flex-row">
                <SheetClose render={<Button variant="outline" className="flex-1" />}>
                    Cancelar
                </SheetClose>
                <Button
                    type="submit"
                    form="edit-team-form"
                    disabled={isPending}
                    className="flex-1"
                >
                    {isPending ? "Salvando..." : "Salvar"}
                </Button>
            </SheetFooter>
        </>
    );
}
