import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { ResetPasswordPage } from "@/src/view/pages/ResetPassword";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const newPassword = "Nova@1234";

function renderResetPasswordPage(route = "/reset-password?token=token-123") {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<p>login page</p>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>,
    { route, authenticated: false },
  );
}

function mockResetPassword({
  status = 204,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onRequest = vi.fn();
  server.use(
    http.post(`${API_URL}/auth/reset-password`, async ({ request }) => {
      await delay(responseDelay);
      onRequest(await request.json());
      return new HttpResponse(null, { status });
    }),
  );
  return onRequest;
}

async function submitNewPassword(password = newPassword) {
  const user = userEvent.setup();
  if (password) await user.type(screen.getByLabelText("Nova senha"), password);
  await user.click(screen.getByRole("button", { name: "Redefinir senha" }));
}

describe("ResetPassword Page", () => {
  describe("without a token", () => {
    it("should show the invalid link screen and offer a new link", () => {
      renderResetPasswordPage("/reset-password");

      expect(
        screen.getByRole("heading", { name: "Link inválido" }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
        "href",
        "/forgot-password",
      );
    });
  });

  describe("with a token", () => {
    it("should show the new password form", () => {
      renderResetPasswordPage();

      expect(
        screen.getByRole("heading", { name: "Nova senha" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
    });

    it("should ask for the password and not call the API when it is empty", async () => {
      const onRequest = mockResetPassword();
      renderResetPasswordPage();

      await submitNewPassword("");

      expect(await screen.findByText("Informe a senha")).toBeInTheDocument();
      expect(onRequest).not.toHaveBeenCalled();
    });

    it("should reject a weak password", async () => {
      const onRequest = mockResetPassword();
      renderResetPasswordPage();

      await submitNewPassword("fraca");

      expect(
        await screen.findByText(
          "A senha deve ter no mínimo 8 caracteres, com maiúscula, número e símbolo",
        ),
      ).toBeInTheDocument();
      expect(onRequest).not.toHaveBeenCalled();
    });

    it("should send the token with the new password, show a toast and go to the login", async () => {
      const onRequest = mockResetPassword();
      renderResetPasswordPage();

      await submitNewPassword();

      expect(await screen.findByText("login page")).toBeInTheDocument();
      expect(
        await screen.findByText("Senha redefinida! Entre com a nova senha."),
      ).toBeInTheDocument();
      expect(onRequest).toHaveBeenCalledExactlyOnceWith({
        token: "token-123",
        password: newPassword,
      });
    });

    it("should disable the button while the password is being saved", async () => {
      mockResetPassword({ responseDelay: 100 });
      renderResetPasswordPage();

      await submitNewPassword();

      expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
      expect(await screen.findByText("login page")).toBeInTheDocument();
    });

    it("should switch to the invalid link screen when the API rejects the token", async () => {
      mockResetPassword({ status: 400 });
      renderResetPasswordPage();

      await submitNewPassword();

      expect(
        await screen.findByRole("heading", { name: "Link inválido" }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Nova senha")).not.toBeInTheDocument();
    });

    it.each([
      [429, "Muitas tentativas. Aguarde um pouco e tente novamente."],
      [500, "Não foi possível redefinir a senha. Tente novamente."],
    ])("should keep the form and show the right message on a %i response", async (status, message) => {
      mockResetPassword({ status });
      renderResetPasswordPage();

      await submitNewPassword();

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.getByLabelText("Nova senha")).toBeInTheDocument();
    });
  });
});
