import { Link } from "react-router";
import { Mail, User as UserIcon, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/PasswordInput";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { PasswordRequirements } from "../../components/PasswordRequirements";
import { POSITION_OPTIONS } from "@/src/app/constants/position";
import { useSignupController } from "./useSignupController";

export function SignupPage() {
    const {
        submittedEmail,
        onResend,
        isResending,
        loginLink,
        register,
        positionField,
        password,
        onSubmit,
        errors,
        isPending,
        errorMessage,
    } = useSignupController();

    if (submittedEmail) {
        return (
            <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex flex-col items-center gap-1">
                    <h1 className="text-2xl font-bold text-heading tracking-tight">Confira seu email</h1>
                    <p className="text-sm text-muted-foreground">
                        Enviamos um link de confirmação para{" "}
                        <span className="font-medium text-heading">{submittedEmail}</span>.
                        Clique nele para ativar sua conta.
                    </p>
                </div>
                <div className="w-full max-w-xs flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isResending}
                        onClick={onResend}
                        className="w-full"
                    >
                        {isResending ? "Reenviando..." : "Reenviar email"}
                    </Button>
                    <Button variant="link" size="sm" render={<Link to={loginLink} />}>
                        <span className="text-sm font-medium text-heading">Ir para o login</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold text-heading tracking-tight">Crie sua conta</h1>
                <p className="text-sm text-muted-foreground">
                    Cadastre-se pra começar a organizar suas peladas
                </p>
            </div>
            <form
                onSubmit={onSubmit}
                className="w-full max-w-xs lg:max-w-2xl flex flex-col gap-4 lg:grid lg:grid-cols-2"
            >
                {errorMessage && (
                    <p className="text-sm text-destructive text-center lg:col-span-2">{errorMessage}</p>
                )}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <Input
                            id="name"
                            type="text"
                            label="Nome"
                            icon={UserIcon}
                            aria-invalid={!!errors.name}
                            {...register("name")}
                        />
                        {errors.name && (
                            <span className="text-xs text-destructive">{errors.name.message}</span>
                        )}
                    </div>
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
                            id="confirmEmail"
                            type="text"
                            label="Confirmar email"
                            icon={Mail}
                            aria-invalid={!!errors.confirmEmail}
                            {...register("confirmEmail")}
                        />
                        {errors.confirmEmail && (
                            <span className="text-xs text-destructive">{errors.confirmEmail.message}</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <PasswordInput
                            id="password"
                            label="Senha"
                            icon={Lock}
                            aria-invalid={!!errors.password}
                            {...register("password")}
                        />
                        {errors.password && (
                            <span className="text-xs text-destructive">{errors.password.message}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <PasswordInput
                            id="confirmPassword"
                            label="Confirmar senha"
                            icon={Lock}
                            aria-invalid={!!errors.confirmPassword}
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <span className="text-xs text-destructive">{errors.confirmPassword.message}</span>
                        )}
                    </div>
                    <PasswordRequirements password={password} />
                </div>
                <div className="flex flex-col gap-1 lg:col-span-2">
                    <span className="text-xs text-strong">Posição</span>
                    <RadioGroup
                        aria-invalid={!!errors.position}
                        value={positionField.value}
                        onValueChange={positionField.onChange}
                        className="sm:grid sm:grid-cols-2"
                    >
                        {POSITION_OPTIONS.map((option) => (
                            <RadioGroupItem
                                key={option.value}
                                value={option.value}
                                icon={option.icon}
                            >
                                {option.label}
                            </RadioGroupItem>
                        ))}
                    </RadioGroup>
                    {errors.position && (
                        <span className="text-xs text-destructive">{errors.position.message}</span>
                    )}
                </div>
                <Button type="submit" disabled={isPending} className="w-full lg:col-span-2">
                    {isPending ? "Criando conta..." : "Criar conta"}
                </Button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-1">
                <span className="text-sm font-medium">Já tem uma conta?</span>
                <Button variant={"link"} size={"sm"} render={<Link to={loginLink} />}>
                    <span className="text-sm font-medium text-heading">Entrar</span>
                </Button>
            </div>
        </div>
    );
}
