import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { ChangePasswordModal } from ".";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

type User = ReturnType<typeof userEvent.setup>;

const currentPassword = "Atual@1234";
const newPassword = "Nova@1234";

function mockChangePassword({
  status = 200,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onChange = vi.fn();
  server.use(
    http.post(`${API_URL}/users/change-password`, async ({ request }) => {
      await delay(responseDelay);
      onChange(await request.json());
      return HttpResponse.json(
        status === 200 ? { accessToken: "new-token" } : {},
        { status },
      );
    }),
  );
  return onChange;
}

async function openForm() {
  const user = userEvent.setup();
  renderWithProviders(<ChangePasswordModal />);
  await user.click(screen.getByRole("button", { name: "Trocar senha" }));
  await screen.findByRole("dialog");
  return user;
}

function submit() {
  return within(screen.getByRole("dialog")).getByRole("button", {
    name: "Trocar senha",
  });
}

async function fillAndSubmit(user: User, current = currentPassword, next = newPassword) {
  await user.type(screen.getByLabelText("Senha atual"), current);
  await user.type(screen.getByLabelText("Nova senha"), next);
  await user.click(submit());
}

describe("ChangePasswordModal", () => {
  it("should open the form only after the user clicks the trigger", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangePasswordModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Trocar senha" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha atual")).toBeInTheDocument();
    expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
  });

  describe("form validation", () => {
    it("should ask for both passwords and not call the API", async () => {
      const onChange = mockChangePassword();
      const user = await openForm();

      await user.click(submit());

      expect(
        await screen.findByText("Informe sua senha atual"),
      ).toBeInTheDocument();
      expect(screen.getByText("Informe a senha")).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should reject a weak new password", async () => {
      const onChange = mockChangePassword();
      const user = await openForm();

      await fillAndSubmit(user, currentPassword, "fraca");

      expect(
        await screen.findByText(
          "A senha deve ter no mínimo 8 caracteres, com maiúscula, número e símbolo",
        ),
      ).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("successful change", () => {
    it("should send both passwords, keep the session with the new token and close the form", async () => {
      const onChange = mockChangePassword();
      const user = await openForm();
      expect(authTokenStorage.get()).toBe("test-token");

      await fillAndSubmit(user);

      expect(await screen.findByText("Senha alterada")).toBeInTheDocument();
      expect(onChange).toHaveBeenCalledExactlyOnceWith({
        currentPassword,
        newPassword,
      });
      expect(authTokenStorage.get()).toBe("new-token");
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("should disable the submit button while the password is being changed", async () => {
      mockChangePassword({ responseDelay: 100 });
      const user = await openForm();

      await fillAndSubmit(user);

      expect(
        within(screen.getByRole("dialog")).getByRole("button", {
          name: "Salvando...",
        }),
      ).toBeDisabled();
      expect(await screen.findByText("Senha alterada")).toBeInTheDocument();
    });
  });

  describe("failed change", () => {
    it.each([
      [400, "Senha atual incorreta."],
      [429, "Muitas tentativas. Aguarde um pouco e tente novamente."],
      [500, "Não foi possível trocar a senha. Tente novamente."],
    ])("should keep the form open and show the right message on a %i response", async (status, message) => {
      mockChangePassword({ status });
      const user = await openForm();
      const tokenBefore = authTokenStorage.get();

      await fillAndSubmit(user);

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(authTokenStorage.get()).toBe(tokenBefore);
    });

    it("should start clean when the form is opened again", async () => {
      mockChangePassword({ status: 400 });
      const user = await openForm();
      await fillAndSubmit(user);
      expect(await screen.findByText("Senha atual incorreta.")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await user.click(screen.getByRole("button", { name: "Trocar senha" }));

      expect(await screen.findByLabelText("Senha atual")).toHaveValue("");
      expect(screen.getByLabelText("Nova senha")).toHaveValue("");
      expect(
        screen.queryByText("Senha atual incorreta."),
      ).not.toBeInTheDocument();
    });
  });
});
