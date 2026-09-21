import type { ReactNode } from "react";
import { Link, Navigate } from "react-router";
import { Button } from "../../components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { FREQUENCY_LABELS } from "@/src/app/constants/frequencyType";
import { JOINABLE_MEMBER_TYPE_OPTIONS } from "@/src/app/constants/groupMemberType";
import { RANK_OPTIONS } from "@/src/app/constants/rank";
import { WEEKDAY_LABELS } from "@/src/app/constants/weekday";
import logoFutPlus from "../../../app/assets/logo-fut-plus.png";
import { useInviteController } from "./useInviteController";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function InviteShell({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-app p-4">
            <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-sm">
                <img src={logoFutPlus} alt="Fut+" className="w-24" />
                {children}
            </div>
        </div>
    );
}

export function InvitePage() {
    const {
        isAuthenticated,
        loginRedirect,
        invite,
        isLoading,
        isError,
        typeField,
        rankField,
        onSubmit,
        errors,
        isPending,
    } = useInviteController();

    if (!isAuthenticated) {
        return <Navigate to={loginRedirect} replace />;
    }

    if (isLoading) {
        return (
            <InviteShell>
                <div className="h-40 w-full animate-pulse rounded-xl bg-gray-200" />
            </InviteShell>
        );
    }

    if (isError || !invite) {
        return (
            <InviteShell>
                <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-bold text-primary-900">
                        Convite inválido
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Esse link não existe ou foi revogado. Peça um novo link ao dono
                        do grupo.
                    </p>
                </div>
                <Button render={<Link to="/home" />}>Ir para o início</Button>
            </InviteShell>
        );
    }

    const { group, owner } = invite;

    return (
        <InviteShell>
            <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-sm text-muted-foreground">
                    {owner.name} convidou você para
                </span>
                <h1 className="text-2xl font-bold text-primary-900">{group.name}</h1>
                <div className="flex flex-wrap justify-center gap-1.5 text-xs text-muted-foreground">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                        {WEEKDAY_LABELS[group.weekday]}, {group.hour}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                        {FREQUENCY_LABELS[group.frequency]}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                        {currencyFormatter.format(group.valuePerUser)} por pessoa
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5">
                        {invite.membersCount}{" "}
                        {invite.membersCount === 1 ? "jogador" : "jogadores"}
                    </span>
                </div>
            </div>

            {invite.alreadyMember ? (
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-muted-foreground">
                        Você já faz parte deste grupo.
                    </p>
                    <Button render={<Link to={`/groups/${group.id}`} />}>
                        Ir para o grupo
                    </Button>
                </div>
            ) : (
                <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-800" htmlFor="invite-type">
                            Como você vai jogar
                        </label>
                        <Select
                            items={JOINABLE_MEMBER_TYPE_OPTIONS}
                            value={typeField.value}
                            onValueChange={typeField.onChange}
                        >
                            <SelectTrigger
                                id="invite-type"
                                className="w-full"
                                aria-invalid={!!errors.type}
                            >
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {JOINABLE_MEMBER_TYPE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && (
                            <span className="text-xs text-destructive">
                                {errors.type.message}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-800" htmlFor="invite-rank">
                            Seu nível
                        </label>
                        <Select
                            items={RANK_OPTIONS}
                            value={rankField.value}
                            onValueChange={rankField.onChange}
                        >
                            <SelectTrigger
                                id="invite-rank"
                                className="w-full"
                                aria-invalid={!!errors.rank}
                            >
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {RANK_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.rank && (
                            <span className="text-xs text-destructive">
                                {errors.rank.message}
                            </span>
                        )}
                    </div>

                    <Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? "Entrando..." : "Entrar no grupo"}
                    </Button>
                </form>
            )}
        </InviteShell>
    );
}
