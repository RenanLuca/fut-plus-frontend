import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { useConfirmEmailChangeController } from "./useConfirmEmailChangeController";

export function ConfirmEmailChangePage() {
    const { isSuccess, isEmailTaken, isInvalid, nextLink, nextLabel } =
        useConfirmEmailChangeController();

    const isPendingResult = !isSuccess && !isEmailTaken && !isInvalid;

    const title = isSuccess
        ? "Email alterado!"
        : isEmailTaken
          ? "Email indisponível"
          : isInvalid
            ? "Link inválido"
            : "Confirmando seu novo email...";

    const description = isSuccess
        ? "Seu email foi atualizado com sucesso."
        : isEmailTaken
          ? "Outra conta já está usando esse email. Peça a troca novamente com outro endereço."
          : isInvalid
            ? "Esse link expirou ou já foi usado. Peça a troca de email novamente."
            : "Só um instante.";

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6 text-center">
            <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl font-bold text-heading tracking-tight">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {!isPendingResult && (
                <Button className="w-full max-w-xs" render={<Link to={nextLink} />}>
                    {nextLabel}
                </Button>
            )}
        </div>
    );
}
