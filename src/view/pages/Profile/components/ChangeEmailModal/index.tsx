import { Mail } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { PasswordInput } from "../../../../components/PasswordInput";
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
import { useChangeEmailController } from "./useChangeEmailController";

export function ChangeEmailModal() {
    const {
        open,
        onOpenChange,
        register,
        onSubmit,
        errors,
        isPending,
        errorMessage,
    } = useChangeEmailController();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger render={<Button variant="outline" className="w-full" />}>
                <Mail className="size-4" />
                Trocar email
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Trocar email</SheetTitle>
                    <SheetDescription>
                        Enviamos um link para o novo email. O email atual só muda
                        depois que você confirmar por lá.
                    </SheetDescription>
                </SheetHeader>
                <form
                    id="change-email-form"
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4 px-6"
                >
                    {errorMessage && (
                        <p className="text-sm text-destructive">{errorMessage}</p>
                    )}
                    <div className="flex flex-col gap-1">
                        <Input
                            id="new-email"
                            type="text"
                            label="Novo email"
                            aria-invalid={!!errors.newEmail}
                            {...register("newEmail")}
                        />
                        {errors.newEmail && (
                            <span className="text-xs text-destructive">
                                {errors.newEmail.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <PasswordInput
                            id="change-email-password"
                            label="Sua senha"
                            aria-invalid={!!errors.password}
                            {...register("password")}
                        />
                        {errors.password && (
                            <span className="text-xs text-destructive">
                                {errors.password.message}
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
                        form="change-email-form"
                        disabled={isPending}
                        className="flex-1"
                    >
                        {isPending ? "Enviando..." : "Enviar link"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
