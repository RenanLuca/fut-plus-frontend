import { Link } from "react-router";
import { Mail } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useForgotPasswordController } from "./useForgotPasswordController";

export function ForgotPasswordPage() {
    const { submittedEmail, register, onSubmit, errors, isPending, errorMessage } =
        useForgotPasswordController();

    if (submittedEmail) {
        return (
            <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex flex-col items-center gap-1">
                    <h1 className="text-2xl font-bold text-heading tracking-tight">Confira seu email</h1>
                    <p className="text-sm text-muted-foreground">
                        Se existir uma conta com{" "}
                        <span className="font-medium text-heading">{submittedEmail}</span>,
                        enviamos um link para redefinir a senha.
                    </p>
                </div>
                <Button className="w-full max-w-xs" render={<Link to="/" />}>
                    Voltar para o login
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold text-heading tracking-tight">Esqueceu a senha?</h1>
                <p className="text-sm text-muted-foreground">
                    Informe seu email e enviaremos um link para criar uma nova
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
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Enviando..." : "Enviar link"}
                </Button>
            </form>
            <Button variant="link" size="sm" render={<Link to="/" />}>
                <span className="text-sm font-medium text-heading">Voltar para o login</span>
            </Button>
        </div>
    );
}
