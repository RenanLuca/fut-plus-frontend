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
                    A troca de email virá com o sistema de email.
                </span>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-800" htmlFor="profile-position">
                    Posição
                </label>
                <Select
                    items={POSITION_OPTIONS}
                    value={positionField.value}
                    onValueChange={positionField.onChange}
                >
                    <SelectTrigger
                        id="profile-position"
                        className="w-full"
                        aria-invalid={!!errors.position}
                    >
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
