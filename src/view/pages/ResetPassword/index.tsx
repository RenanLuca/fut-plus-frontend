import { Link } from "react-router";
import { Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { PasswordInput } from "../../components/PasswordInput";
import { useResetPasswordController } from "./useResetPasswordController";

export function ResetPasswordPage() {
    const { isInvalidToken, register, onSubmit, errors, isPending, errorMessage } =
        useResetPasswordController();

    if (isInvalidToken) {
        return (
            <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex flex-col items-center gap-1">
                    <h1 className="text-2xl font-bold text-heading tracking-tight">Link inválido</h1>
                    <p className="text-sm text-muted-foreground">
                        Esse link expirou ou já foi usado. Peça um novo para redefinir a senha.
                    </p>
                </div>
                <Button className="w-full max-w-xs" render={<Link to="/forgot-password" />}>
                    Pedir novo link
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold text-heading tracking-tight">Nova senha</h1>
                <p className="text-sm text-muted-foreground">
                    Escolha uma senha nova para a sua conta
                </p>
            </div>
            <form onSubmit={onSubmit} className="w-full max-w-xs flex flex-col gap-4">
                {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                )}
                <div className="flex flex-col gap-1">
                    <PasswordInput
                        id="password"
                        label="Nova senha"
                        icon={Lock}
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                    {errors.password && (
                        <span className="text-xs text-destructive">{errors.password.message}</span>
                    )}
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Salvando..." : "Redefinir senha"}
                </Button>
            </form>
        </div>
    );
}
