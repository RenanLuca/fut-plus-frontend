import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { RadioGroup, RadioGroupItem } from "../../../../components/ui/radio-group";
import { POSITION_OPTIONS } from "@/src/app/constants/position";
import type { CurrentUser } from "@/src/app/services/usersService";
import { formatPhone, onlyPhoneDigits } from "@/src/app/utils/phone";
import { useProfileFormController } from "./useProfileFormController";

export function ProfileForm({ user }: { user: CurrentUser }) {
    const {
        register,
        positionField,
        phoneField,
        onSubmit,
        errors,
        canSave,
        isPending,
    } = useProfileFormController(user);

    return (
        <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-1">
                <Input
                    id="profile-name"
                    type="text"
                    label="Nome"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                />
                {errors.name && (
                    <span className="text-xs text-destructive">{errors.name.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Input
                    id="profile-email"
                    type="email"
                    label="Email"
                    value={user.email}
                    disabled
                    readOnly
                />
                <span className="text-xs text-muted-foreground">
                    Para alterar, use "Trocar email" na seção Segurança.
                </span>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs text-strong">Posição</span>
                <RadioGroup
                    aria-invalid={!!errors.position}
                    value={positionField.value}
                    onValueChange={positionField.onChange}
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

            <div className="flex flex-col gap-1">
                <Input
                    id="profile-phone"
                    type="tel"
                    inputMode="tel"
                    label="Telefone (opcional)"
                    placeholder="(11) 99999-9999"
                    aria-invalid={!!errors.telefone}
                    value={formatPhone(phoneField.value)}
                    onChange={(event) =>
                        phoneField.onChange(onlyPhoneDigits(event.target.value))
                    }
                    onBlur={phoneField.onBlur}
                />
                {errors.telefone && (
                    <span className="text-xs text-destructive">{errors.telefone.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <Input
                    id="profile-picture"
                    type="text"
                    inputMode="url"
                    label="Link da foto (opcional)"
                    placeholder="https://..."
                    aria-invalid={!!errors.profilePicture}
                    {...register("profilePicture")}
                />
                {errors.profilePicture && (
                    <span className="text-xs text-destructive">
                        {errors.profilePicture.message}
                    </span>
                )}
            </div>

            <Button type="submit" disabled={!canSave} className="w-full">
                {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
        </form>
    );
}
