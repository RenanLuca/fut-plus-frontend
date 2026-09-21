import { Link } from "react-router";
import { Mail, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useLoginController } from "./useLoginController";

export function LoginPage() {
    const { signupLink, register, onSubmit, errors, isPending, errorMessage } =
        useLoginController();

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold text-heading tracking-tight">Seja bem-vindo!</h1>
                <p className="text-sm text-muted-foreground">
                    Organize a pelada da sua galera em poucos cliques
                </p>
            </div>
            <form onSubmit={onSubmit} className="w-full max-w-xs flex flex-col gap-4">
                {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                )}
                <div className="flex flex-col gap-1">
                    <Input
                        id="email"
                        type="text"
                        label="Email"
                        icon={Mail}
                        aria-invalid={!!errors.email}
                        {...register("email")}
                    />
                    {errors.email && (
                        <span className="text-xs text-destructive">{errors.email.message}</span>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                    <Input
                        id="password"
                        type="password"
                        label="Senha"
                        icon={Lock}
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                    {errors.password && (
                        <span className="text-xs text-destructive">{errors.password.message}</span>
                    )}
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Entrando..." : "Entrar"}
                </Button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-1">
                <span className="text-sm font-medium">Ainda não tem uma conta?</span>
                <Button variant={"link"} size={"sm"} render={<Link to={signupLink} />}>
                    <span className="text-sm font-medium text-heading">Cadastre-se</span>
                </Button>
            </div>
        </div>
    );
}
