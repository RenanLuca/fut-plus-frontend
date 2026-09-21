import { Copy, Link2, RefreshCw, Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "../../../components/ui/sheet";
import { useInviteLinkController } from "./useInviteLinkController";

export function InviteLinkContent({ groupId }: { groupId: string }) {
    const {
        link,
        isLoading,
        copyLink,
        regenerate,
        isRegenerating,
        revoke,
        isRevoking,
        confirming,
        setConfirming,
    } = useInviteLinkController(groupId);

    return (
        <>
            <SheetHeader>
                <SheetTitle>Convidar por link</SheetTitle>
                <SheetDescription>
                    Quem abrir o link entra no grupo escolhendo o próprio tipo e nível
                </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-6">
                {isLoading && <div className="h-24 animate-pulse rounded-xl bg-gray-100" />}

                {!isLoading && !link && (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-primary-200 bg-item py-8 text-center">
                        <Link2 className="size-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-gray-700">
                            Este grupo ainda não tem um link de convite
                        </p>
                        <Button size="sm" disabled={isRegenerating} onClick={regenerate}>
                            {isRegenerating ? "Gerando..." : "Gerar link"}
                        </Button>
                    </div>
                )}

                {!isLoading && link && (
                    <>
                        <div className="flex items-end gap-2">
                            <Input
                                id="invite-link"
                                label="Link de convite"
                                readOnly
                                value={link}
                                onFocus={(event) => event.currentTarget.select()}
                            />
                            <Button variant="outline" onClick={copyLink}>
                                <Copy className="size-4" />
                                Copiar
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            O link não expira. Se ele vazar, gere um novo ou revogue.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setConfirming("regenerate")}
                            >
                                <RefreshCw className="size-4" />
                                Gerar novo link
                            </Button>
                            <Button
                                variant="outline"
                                className="text-destructive"
                                onClick={() => setConfirming("revoke")}
                            >
                                <Trash2 className="size-4" />
                                Revogar link
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                open={confirming === "regenerate"}
                onOpenChange={(open) => !open && setConfirming(null)}
                title="Gerar novo link?"
                description="O link atual deixa de funcionar. Quem já entrou continua no grupo."
                confirmLabel="Gerar novo link"
                isPending={isRegenerating}
                onConfirm={regenerate}
            />
            <ConfirmDialog
                open={confirming === "revoke"}
                onOpenChange={(open) => !open && setConfirming(null)}
                title="Revogar link?"
                description="O link deixa de funcionar e ninguém mais entra por ele. Quem já entrou continua no grupo."
                confirmLabel="Revogar link"
                isPending={isRevoking}
                onConfirm={revoke}
            />
        </>
    );
}
