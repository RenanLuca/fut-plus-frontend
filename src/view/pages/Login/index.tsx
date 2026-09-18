import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useLoginController } from "./useLoginController";

export function LoginPage() {
    const { register, onSubmit, errors, isPending, errorMessage } =
        useLoginController();

    return (
        <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-6">
            <h1 className="text-xl font-bold text-primary-900">Seja bem vindo!</h1>
            <form onSubmit={onSubmit} className="w-full max-w-xs flex flex-col gap-4">
                {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                )}
                <div className="flex flex-col gap-1">
                    <Input
                        id="email"
                        type="text"
                        label="Email"
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
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                    {errors.password && (
                        <span className="text-xs text-destructive">{errors.password.message}</span>
                    )}
                </div>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Entrando..." : "Entrar"}
                </Button>
            </form>
            <div>
                <span className="text-sm font-medium">Ainda não tem uma conta?</span>
                <Button variant={"link"} size={"sm"} render={<Link to="/signup" />}>
                    <span className="text-sm font-medium text-primary-900">Cadastre-se</span>
                </Button>
            </div>
        </div>
    );
}
