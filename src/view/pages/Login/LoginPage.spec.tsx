import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { LoginPage } from "@/src/view/pages/Login";
import { authTokenStorage } from "@/src/app/lib/auth-token-storage";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const credentials = { email: "renan@gmail.com", password: "123456" };

function renderLoginPage(route = "/") {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<p>home page</p>} />
      <Route path="/groups/123" element={<p>group page</p>} />
    </Routes>,
    { route, authenticated: false },
  );
}

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), credentials.email);
  await user.type(screen.getByLabelText("Senha"), credentials.password);
  await user.click(screen.getByRole("button", { name: "Entrar" }));
  return user;
}

describe("Login Page", () => {
  describe("successful login", () => {
    it("should send the credentials, store the token and go to home", async () => {
      const onSignin = vi.fn();
      server.use(
        http.post(`${API_URL}/auth/signin`, async ({ request }) => {
          onSignin(await request.json());
          return HttpResponse.json({ accessToken: "valid-token" });
        }),
      );
      renderLoginPage();

      await fillAndSubmit();

      expect(await screen.findByText("home page")).toBeInTheDocument();
      expect(onSignin).toHaveBeenCalledExactlyOnceWith(credentials);
      expect(authTokenStorage.get()).toBe("valid-token");
    });

    it("should go to the redirect path when there is one", async () => {
      server.use(
        http.post(`${API_URL}/auth/signin`, () =>
          HttpResponse.json({ accessToken: "valid-token" }),
        ),
      );
      renderLoginPage("/?redirect=/groups/123");

      await fillAndSubmit();

      expect(await screen.findByText("group page")).toBeInTheDocument();
    });

    it("should disable the button while the request is pending", async () => {
      server.use(
        http.post(`${API_URL}/auth/signin`, async () => {
          await delay(100);
          return HttpResponse.json({ accessToken: "valid-token" });
        }),
      );
      renderLoginPage();

      await fillAndSubmit();

      expect(
        screen.getByRole("button", { name: "Entrando..." }),
      ).toBeDisabled();
      expect(await screen.findByText("home page")).toBeInTheDocument();
    });
  });

  describe("failed login", () => {
    it.each([
      [401, "Email ou senha inválidos"],
      [429, "Muitas tentativas. Aguarde um pouco e tente novamente."],
      [500, "Não foi possível entrar. Tente novamente."],
    ])(
      "should show the right message on a %i response",
      async (status, message) => {
        server.use(
          http.post(`${API_URL}/auth/signin`, () =>
            HttpResponse.json({}, { status }),
          ),
        );
        renderLoginPage();

        await fillAndSubmit();

        expect(await screen.findByText(message)).toBeInTheDocument();
        expect(screen.queryByText("home page")).not.toBeInTheDocument();
        expect(authTokenStorage.get()).toBeNull();
      },
    );

    it("should offer to resend the verification when the email is not verified", async () => {
      const onResend = vi.fn();
      server.use(
        http.post(`${API_URL}/auth/signin`, () =>
          HttpResponse.json({}, { status: 403 }),
        ),
        http.post(
          `${API_URL}/auth/resend-verification`,
          async ({ request }) => {
            onResend(await request.json());
            return new HttpResponse(null, { status: 204 });
          },
        ),
      );
      renderLoginPage();
      const user = await fillAndSubmit();

      expect(
        await screen.findByText(/Confirme seu email antes de entrar/),
      ).toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "Reenviar verificação" }),
      );

      expect(
        await screen.findByText(
          "Se o email existir, enviamos um novo link de verificação.",
        ),
      ).toBeInTheDocument();
      expect(onResend).toHaveBeenCalledExactlyOnceWith({
        email: credentials.email,
      });
    });
  });

  describe("form validation", () => {
    it("should show the field errors and not call the API", async () => {
      const onSignin = vi.fn();
      server.use(
        http.post(`${API_URL}/auth/signin`, () => {
          onSignin();
          return HttpResponse.json({ accessToken: "valid-token" });
        }),
      );
      renderLoginPage();

      await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

      expect(await screen.findByText("Informe o email")).toBeInTheDocument();
      expect(
        screen.getByText("A senha deve ter no mínimo 6 caracteres"),
      ).toBeInTheDocument();
      expect(onSignin).not.toHaveBeenCalled();
    });
  });

  describe("links", () => {
    it("should keep the redirect param on the signup link", () => {
      renderLoginPage("/?redirect=/groups/123");

      expect(screen.getByRole("link", { name: "Cadastre-se" })).toHaveAttribute(
        "href",
        "/signup?redirect=%2Fgroups%2F123",
      );
    });
  });
});
