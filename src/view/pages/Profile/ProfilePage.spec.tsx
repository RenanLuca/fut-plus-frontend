import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { ProfilePage } from "@/src/view/pages/Profile";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";
import { makeUserMock } from "@/__tests__/factories/user";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function renderProfilePage() {
  const user = userEvent.setup();
  renderWithProviders(<ProfilePage />);
  return user;
}

// O servidor devolve o usuário com o payload aplicado, como a API de verdade
function mockUpdateUser({
  status = 200,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onUpdate = vi.fn();
  server.use(
    http.put(`${API_URL}/users`, async ({ request }) => {
      await delay(responseDelay);
      const payload = (await request.json()) as Record<string, unknown>;
      onUpdate(payload);
      return HttpResponse.json(status === 200 ? makeUserMock(payload) : {}, {
        status,
      });
    }),
  );
  return onUpdate;
}

function mockCurrentUser(overrides: Parameters<typeof makeUserMock>[0]) {
  server.use(
    http.get(`${API_URL}/users/me`, () =>
      HttpResponse.json(makeUserMock(overrides)),
    ),
  );
}

describe("Profile Page", () => {
  describe("loading and content", () => {
    it("should show only the skeleton while the user is loading", async () => {
      server.use(
        http.get(`${API_URL}/users/me`, async () => {
          await delay(100);
          return HttpResponse.json(makeUserMock());
        }),
      );

      renderProfilePage();

      expect(screen.getByRole("heading", { name: "Perfil" })).toBeInTheDocument();
      expect(screen.queryByLabelText("Nome")).not.toBeInTheDocument();
      expect(await screen.findByLabelText("Nome")).toBeInTheDocument();
    });

    it("should show the user data and every section", async () => {
      renderProfilePage();

      expect(await screen.findByLabelText("Nome")).toHaveValue("Renan de Luca");
      expect(screen.getByText("RD")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toHaveValue("renan@gmail.com");
      expect(screen.getByLabelText("Email")).toBeDisabled();
      expect(screen.getByRole("radio", { name: "Zagueiro" })).toBeChecked();
      expect(
        screen.getByRole("heading", { name: "Notificações" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Segurança" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Aparência" }),
      ).toBeInTheDocument();
    });

    it("should fill the optional fields when the user has them", async () => {
      mockCurrentUser({
        telefone: "11999998888",
        profilePicture: "https://example.com/me.png",
      });

      renderProfilePage();

      expect(await screen.findByLabelText("Telefone (opcional)")).toHaveValue(
        "(11) 99999-8888",
      );
      expect(screen.getByLabelText("Link da foto (opcional)")).toHaveValue(
        "https://example.com/me.png",
      );
    });
  });

  describe("profile form", () => {
    it("should only enable the save button after a change", async () => {
      const user = renderProfilePage();
      const save = await screen.findByRole("button", {
        name: "Salvar alterações",
      });
      expect(save).toBeDisabled();

      await user.type(screen.getByLabelText("Nome"), " Jr");

      expect(save).toBeEnabled();
    });

    it("should save the changes, refresh the page data and show a toast", async () => {
      const onUpdate = mockUpdateUser();
      const user = renderProfilePage();
      const name = await screen.findByLabelText("Nome");

      await user.clear(name);
      await user.type(name, "Renan Silva");
      await user.click(screen.getByRole("radio", { name: "Atacante" }));
      await user.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      expect(await screen.findByText("Perfil atualizado")).toBeInTheDocument();
      expect(onUpdate).toHaveBeenCalledExactlyOnceWith({
        name: "Renan Silva",
        position: "STRIKER",
        telefone: "",
        profilePicture: "",
      });
      expect(screen.getByText("RS")).toBeInTheDocument();
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: "Salvar alterações" }),
        ).toBeDisabled(),
      );
    });

    it("should mask the phone while typing and send only the digits", async () => {
      const onUpdate = mockUpdateUser();
      const user = renderProfilePage();
      const phone = await screen.findByLabelText("Telefone (opcional)");

      await user.type(phone, "11999998888");
      expect(phone).toHaveValue("(11) 99999-8888");
      await user.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      expect(await screen.findByText("Perfil atualizado")).toBeInTheDocument();
      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ telefone: "11999998888" }),
      );
    });

    it("should disable the button while the profile is being saved", async () => {
      mockUpdateUser({ responseDelay: 100 });
      const user = renderProfilePage();

      await user.type(await screen.findByLabelText("Nome"), " Jr");
      await user.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
      expect(await screen.findByText("Perfil atualizado")).toBeInTheDocument();
    });

    it("should show an error toast and keep the form editable when the API fails", async () => {
      mockUpdateUser({ status: 500 });
      const user = renderProfilePage();

      await user.type(await screen.findByLabelText("Nome"), " Jr");
      await user.click(
        screen.getByRole("button", { name: "Salvar alterações" }),
      );

      expect(
        await screen.findByText(
          "Não foi possível atualizar o perfil. Tente novamente.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Nome")).toHaveValue("Renan de Luca Jr");
      expect(
        screen.getByRole("button", { name: "Salvar alterações" }),
      ).toBeEnabled();
    });

    it.each([
      {
        field: "Nome",
        value: "",
        message: "Informe o nome",
      },
      {
        field: "Telefone (opcional)",
        value: "123",
        message: "Informe o DDD e o número (10 ou 11 dígitos)",
      },
      {
        field: "Link da foto (opcional)",
        value: "ftp://example.com/me.png",
        message: "Informe um link começando com http:// ou https://",
      },
    ])(
      "should reject an invalid $field and not call the API",
      async ({ field, value, message }) => {
        const onUpdate = mockUpdateUser();
        const user = renderProfilePage();
        const input = await screen.findByLabelText(field);

        await user.clear(input);
        if (value) await user.type(input, value);
        await user.click(
          screen.getByRole("button", { name: "Salvar alterações" }),
        );

        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(onUpdate).not.toHaveBeenCalled();
      },
    );
  });

  describe("email notifications", () => {
    it("should reflect the user preference in the switch", async () => {
      renderProfilePage();

      expect(
        await screen.findByRole("switch", { name: "Emails de partida aberta" }),
      ).toBeChecked();
    });

    it("should turn the preference off and update the switch", async () => {
      const onUpdate = mockUpdateUser();
      const user = renderProfilePage();

      await user.click(
        await screen.findByRole("switch", { name: "Emails de partida aberta" }),
      );

      await waitFor(() =>
        expect(
          screen.getByRole("switch", { name: "Emails de partida aberta" }),
        ).not.toBeChecked(),
      );
      expect(onUpdate).toHaveBeenCalledExactlyOnceWith({
        emailNotifications: false,
      });
    });

    it("should turn the preference back on for a user that had it off", async () => {
      mockCurrentUser({ emailNotifications: false });
      const onUpdate = mockUpdateUser();
      const user = renderProfilePage();

      await user.click(
        await screen.findByRole("switch", { name: "Emails de partida aberta" }),
      );

      await waitFor(() =>
        expect(
          screen.getByRole("switch", { name: "Emails de partida aberta" }),
        ).toBeChecked(),
      );
      expect(onUpdate).toHaveBeenCalledExactlyOnceWith({
        emailNotifications: true,
      });
    });

    it("should keep the preference and show a toast when the API fails", async () => {
      mockUpdateUser({ status: 500 });
      const user = renderProfilePage();

      await user.click(
        await screen.findByRole("switch", { name: "Emails de partida aberta" }),
      );

      expect(
        await screen.findByText(
          "Não foi possível atualizar a preferência. Tente novamente.",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("switch", { name: "Emails de partida aberta" }),
      ).toBeChecked();
    });
  });

  describe("appearance", () => {
    it("should start on the system theme and let the user pick another", async () => {
      const user = renderProfilePage();
      expect(await screen.findByRole("radio", { name: "Sistema" })).toBeChecked();

      await user.click(screen.getByRole("radio", { name: "Escuro" }));

      expect(screen.getByRole("radio", { name: "Escuro" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Sistema" })).not.toBeChecked();
      expect(document.documentElement).toHaveClass("dark");
    });
  });

  describe("logout", () => {
    it("should clear the session when the user leaves", async () => {
      const user = renderProfilePage();
      expect(authTokenStorage.get()).not.toBeNull();

      await user.click(
        await screen.findByRole("button", { name: "Sair da conta" }),
      );

      await waitFor(() => expect(authTokenStorage.get()).toBeNull());
    });
  });
});
