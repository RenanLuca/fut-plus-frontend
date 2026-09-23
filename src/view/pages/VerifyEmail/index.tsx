import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { useVerifyEmailController } from "./useVerifyEmailController";

export function VerifyEmailPage() {
    const { isInvalid } = useVerifyEmailController();

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6 text-center">
            <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl font-bold text-heading tracking-tight">
                    {isInvalid ? "Link inválido" : "Confirmando seu email..."}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {isInvalid
                        ? "Esse link expirou ou já foi usado. Entre e peça um novo link de verificação."
                        : "Só um instante."}
                </p>
            </div>
            {isInvalid && (
                <Button className="w-full max-w-xs" render={<Link to="/" />}>
                    Ir para o login
                </Button>
            )}
        </div>
    );
}
