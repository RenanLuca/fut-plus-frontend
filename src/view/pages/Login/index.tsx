import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function LoginPage() {
    return (
        <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-6">
            <h1 className="text-xl font-bold text-primary-900">Seja bem vindo!</h1>
            <form action="" className="flex flex-col gap-4">
                <Input type="text" label="Email" />
                <Input type="text" label="Senha" />
                <Button>Entrar</Button>
            </form>
            <div>
                <span className="text-sm font-medium">Ainda não tem uma conta?</span>
                <Button variant={"link"} size={"sm"}>
                    <span className="text-sm font-medium text-primary-900">Cadastre-se</span>
                </Button>
            </div>
        </div>
    );
}