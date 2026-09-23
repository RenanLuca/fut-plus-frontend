import { Lock } from "lucide-react";
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
import { useChangePasswordController } from "./useChangePasswordController";

export function ChangePasswordModal() {
    const {
        open,
        onOpenChange,
        register,
        onSubmit,
        errors,
        isPending,
        errorMessage,
    } = useChangePasswordController();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger render={<Button variant="outline" className="w-full" />}>
                <Lock className="size-4" />
                Trocar senha
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Trocar senha</SheetTitle>
                    <SheetDescription>
                        Informe a senha atual e escolha uma nova
                    </SheetDescription>
                </SheetHeader>
                <form
                    id="change-password-form"
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4 px-6"
                >
                    {errorMessage && (
                        <p className="text-sm text-destructive">{errorMessage}</p>
                    )}
                    <div className="flex flex-col gap-1">
                        <Input
                            id="current-password"
                            type="password"
                            label="Senha atual"
                            aria-invalid={!!errors.currentPassword}
                            {...register("currentPassword")}
                        />
                        {errors.currentPassword && (
                            <span className="text-xs text-destructive">
                                {errors.currentPassword.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Input
                            id="new-password"
                            type="password"
                            label="Nova senha"
                            aria-invalid={!!errors.newPassword}
                            {...register("newPassword")}
                        />
                        {errors.newPassword && (
                            <span className="text-xs text-destructive">
                                {errors.newPassword.message}
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
                        form="change-password-form"
                        disabled={isPending}
                        className="flex-1"
                    >
                        {isPending ? "Salvando..." : "Trocar senha"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
