import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { SignupPage } from "@/src/view/pages/Signup";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

type User = ReturnType<typeof userEvent.setup>;

const validData = {
  name: "Renan de Luca",
  email: "renan@gmail.com",
  password: "Senha@123",
};

function renderSignupPage(route = "/") {
  const user = userEvent.setup();
  renderWithProviders(<SignupPage />, { route, authenticated: false });
  return user;
}

async function fillSignupForm(
  user: User,
  overrides: Partial<{
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
  }> = {},
) {
  const { email, confirmEmail, password, confirmPassword } = {
    email: validData.email,
    confirmEmail: validData.email,
    password: validData.password,
    confirmPassword: validData.password,
    ...overrides,
  };
  await user.type(screen.getByLabelText("Nome"), validData.name);
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Confirmar email"), confirmEmail);
  await user.type(screen.getByLabelText("Senha"), password);
  await user.type(screen.getByLabelText("Confirmar senha"), confirmPassword);
  await user.click(screen.getByRole("radio", { name: "Zagueiro" }));
}

function mockSignup({
  status = 201,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onSignup = vi.fn();
  server.use(
    http.post(`${API_URL}/auth/signup`, async ({ request }) => {
      await delay(responseDelay);
      onSignup(await request.json());
      return HttpResponse.json({}, { status });
    }),
  );
  return onSignup;
}

describe("Signup Page", () => {
  describe("form validation", () => {
    it("should show every required-field error and not call the API", async () => {
      const onSignup = mockSignup();
      const user = renderSignupPage();

      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(await screen.findByText("Informe o nome")).toBeInTheDocument();
      expect(screen.getByText("Informe o email")).toBeInTheDocument();
      expect(screen.getByText("Confirme o email")).toBeInTheDocument();
      expect(screen.getByText("Informe a senha")).toBeInTheDocument();
      expect(screen.getByText("Confirme a senha")).toBeInTheDocument();
      expect(screen.getByText("Selecione uma posição")).toBeInTheDocument();
      expect(onSignup).not.toHaveBeenCalled();
    });

    it("should reject an invalid email", async () => {
      const user = renderSignupPage();

      await fillSignupForm(user, { email: "not-an-email" });
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(await screen.findByText("Email inválido")).toBeInTheDocument();
    });

    it("should reject emails that do not match", async () => {
      const onSignup = mockSignup();
      const user = renderSignupPage();

      await fillSignupForm(user, { confirmEmail: "other@gmail.com" });
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(
        await screen.findByText("Os emails não conferem"),
      ).toBeInTheDocument();
      expect(onSignup).not.toHaveBeenCalled();
    });

    it("should ignore case and spaces when comparing the emails", async () => {
      const onSignup = mockSignup();
      const user = renderSignupPage();

      await fillSignupForm(user, { confirmEmail: " RENAN@GMAIL.COM " });
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(await screen.findByText("Confira seu email")).toBeInTheDocument();
      expect(onSignup).toHaveBeenCalledOnce();
    });

    it("should reject passwords that do not match", async () => {
      const onSignup = mockSignup();
      const user = renderSignupPage();

      await fillSignupForm(user, { confirmPassword: "Other@1234" });
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(
        await screen.findByText("As senhas não conferem"),
      ).toBeInTheDocument();
      expect(onSignup).not.toHaveBeenCalled();
    });

    it.each(["short1!", "semmaiuscula1!", "SemNumero!", "SemSimbolo1"])(
      "should reject the weak password '%s'",
      async (password) => {
        const onSignup = mockSignup();
        const user = renderSignupPage();

        await fillSignupForm(user, { password, confirmPassword: password });
        await user.click(screen.getByRole("button", { name: "Criar conta" }));

        expect(
          await screen.findByText(
            "A senha deve ter no mínimo 8 caracteres, com maiúscula, número e símbolo",
          ),
        ).toBeInTheDocument();
        expect(onSignup).not.toHaveBeenCalled();
      },
    );
  });

  describe("password requirements", () => {
    it("should only list the requirements after the user starts typing", async () => {
      const user = renderSignupPage();
      expect(screen.queryByRole("list")).not.toBeInTheDocument();

      await user.type(screen.getByLabelText("Senha"), "a");

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(4);
      expect(screen.getByText("Mínimo de 8 caracteres")).toBeInTheDocument();
      expect(screen.getByText("Uma letra maiúscula")).toBeInTheDocument();
      expect(screen.getByText("Um número")).toBeInTheDocument();
      expect(screen.getByText("Um símbolo (ex: ! @ #)")).toBeInTheDocument();
    });
  });

  describe("successful signup", () => {
    it("should send only the API fields and ask the user to check the email", async () => {
      const onSignup = mockSignup();
      const user = renderSignupPage();

      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(await screen.findByText("Confira seu email")).toBeInTheDocument();
      expect(screen.getByText(validData.email)).toBeInTheDocument();
      expect(onSignup).toHaveBeenCalledExactlyOnceWith({
        name: validData.name,
        email: validData.email,
        password: validData.password,
        position: "DEFENDER",
      });
    });

    it("should disable the button while the account is being created", async () => {
      mockSignup({ responseDelay: 100 });
      const user = renderSignupPage();

      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(
        screen.getByRole("button", { name: "Criando conta..." }),
      ).toBeDisabled();
      expect(await screen.findByText("Confira seu email")).toBeInTheDocument();
    });

    it("should let the user resend the confirmation email", async () => {
      mockSignup();
      const onResend = vi.fn();
      server.use(
        http.post(`${API_URL}/auth/resend-verification`, async ({ request }) => {
          onResend(await request.json());
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = renderSignupPage();
      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      await user.click(
        await screen.findByRole("button", { name: "Reenviar email" }),
      );

      expect(
        await screen.findByText(
          "Se o email existir, enviamos um novo link de verificação.",
        ),
      ).toBeInTheDocument();
      expect(onResend).toHaveBeenCalledExactlyOnceWith({
        email: validData.email,
      });
    });
  });

  describe("failed signup", () => {
    it.each([
      [409, "Já existe uma conta com esse email"],
      [429, "Muitas tentativas. Aguarde um pouco e tente novamente."],
      [500, "Não foi possível criar sua conta. Tente novamente."],
    ])("should show the right message on a %i response", async (status, message) => {
      mockSignup({ status });
      const user = renderSignupPage();

      await fillSignupForm(user);
      await user.click(screen.getByRole("button", { name: "Criar conta" }));

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.queryByText("Confira seu email")).not.toBeInTheDocument();
    });
  });

  describe("links", () => {
    it("should keep the redirect param on the login link", () => {
      renderSignupPage("/?redirect=/groups/123");

      expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
        "href",
        "/?redirect=%2Fgroups%2F123",
      );
    });
  });
});
