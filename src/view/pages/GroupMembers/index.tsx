import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { GROUP_MEMBER_TYPE_LABELS } from "@/src/app/constants/groupMemberType";
import { getInitials } from "@/src/app/utils/get-initials";
import type { GroupMember } from "@/src/app/services/groupMembersService";
import { useGroupMembersController } from "./useGroupMembersController";

function getMemberName(member: GroupMember) {
    return member.user.name;
}

function MemberRow({
    member,
    onRemove,
}: {
    member: GroupMember;
    onRemove?: () => void;
}) {
    const name = getMemberName(member);
    return (
        <div className="flex items-center gap-3 rounded-lg border border-item-border bg-item p-3">
            <Avatar size="sm">
                {member.user.profilePicture && (
                    <AvatarImage src={member.user.profilePicture} />
                )}
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">
                    {GROUP_MEMBER_TYPE_LABELS[member.type]}
                </span>
            </div>
            {onRemove && (
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remover ${name}`}
                    onClick={onRemove}
                >
                    <Trash2 className="size-4 text-destructive" />
                </Button>
            )}
        </div>
    );
}

export function GroupMembersPage() {
    const {
        group,
        members,
        isLoading,
        isOwner,
        memberToRemove,
        setMemberToRemove,
        confirmRemoval,
        isRemoving,
    } = useGroupMembersController();

    return (
        <>
            {isLoading && (
                <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
            )}
            {!isLoading && members.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum membro ainda</p>
            )}
            {!isLoading && members.length > 0 && (
                <div className="flex flex-col gap-2">
                    {members.map((member) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            onRemove={
                                isOwner && member.userId !== group?.ownerId
                                    ? () => setMemberToRemove(member)
                                    : undefined
                            }
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={memberToRemove !== null}
                onOpenChange={(open) => !open && setMemberToRemove(null)}
                title={`Remover ${memberToRemove ? getMemberName(memberToRemove) : ""}?`}
                description="Essa pessoa deixa de fazer parte do grupo."
                confirmLabel="Remover"
                isPending={isRemoving}
                onConfirm={confirmRemoval}
            />
        </>
    );
}
