import { Link } from "react-router";
import { Mail, User as UserIcon, Lock } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { POSITION_OPTIONS } from "@/src/app/constants/position";
import { useSignupController } from "./useSignupController";

export function SignupPage() {
    const {
        register,
        positionField,
        onSubmit,
        errors,
        isPending,
        errorMessage,
    } = useSignupController();

    return (
        <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold text-primary-900 tracking-tight">Crie sua conta</h1>
                <p className="text-sm text-muted-foreground">
                    Cadastre-se pra começar a organizar suas peladas
                </p>
            </div>
            <form onSubmit={onSubmit} className="w-full max-w-xs flex flex-col gap-4">
                {errorMessage && (
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                )}
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
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-600" htmlFor="position">
                        Posição
                    </label>
                    <Select
                        items={POSITION_OPTIONS}
                        value={positionField.value}
                        onValueChange={positionField.onChange}
                    >
                        <SelectTrigger id="position" className="w-full" aria-invalid={!!errors.position}>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {POSITION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <option.icon className="size-4 text-muted-foreground" />
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.position && (
                        <span className="text-xs text-destructive">{errors.position.message}</span>
                    )}
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Criando conta..." : "Criar conta"}
                </Button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-1">
                <span className="text-sm font-medium">Já tem uma conta?</span>
                <Button variant={"link"} size={"sm"} render={<Link to="/" />}>
                    <span className="text-sm font-medium text-primary-900">Entrar</span>
                </Button>
            </div>
        </div>
    );
}
