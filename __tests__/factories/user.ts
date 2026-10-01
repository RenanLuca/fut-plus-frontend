import type { CurrentUser } from "@/src/app/services/usersService";

export function makeUserMock(
  overrides: Partial<CurrentUser> = {},
): CurrentUser {
  return {
    id: "123",
    createdAt: new Date().toISOString(),
    email: "renan@gmail.com",
    emailNotifications: true,
    emailVerifiedAt: new Date().toISOString(),
    name: "Renan de Luca",
    position: "DEFENDER",
    telefone: null,
    passwordChangedAt: null,
    profilePicture: null,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
