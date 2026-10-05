import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { ChangeEmailModal } from ".";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

type User = ReturnType<typeof userEvent.setup>;

const newEmail = "novo@gmail.com";
const password = "Senha@123";

function mockChangeEmail({
  status = 204,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onChange = vi.fn();
  server.use(
    http.post(`${API_URL}/users/change-email`, async ({ request }) => {
      await delay(responseDelay);
      onChange(await request.json());
      return new HttpResponse(null, { status });
    }),
  );
  return onChange;
}

async function openForm() {
  const user = userEvent.setup();
  renderWithProviders(<ChangeEmailModal />);
  await user.click(screen.getByRole("button", { name: "Trocar email" }));
  await screen.findByRole("dialog");
  return user;
}

function submit() {
  return within(screen.getByRole("dialog")).getByRole("button", {
    name: "Enviar link",
  });
}

async function fillAndSubmit(user: User, email = newEmail) {
  await user.type(screen.getByLabelText("Novo email"), email);
  await user.type(screen.getByLabelText("Sua senha"), password);
  await user.click(submit());
}

describe("ChangeEmailModal", () => {
  it("should open the form only after the user clicks the trigger", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChangeEmailModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Trocar email" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Novo email")).toBeInTheDocument();
    expect(screen.getByLabelText("Sua senha")).toBeInTheDocument();
  });

  describe("form validation", () => {
    it("should ask for the new email and the password and not call the API", async () => {
      const onChange = mockChangeEmail();
      const user = await openForm();

      await user.click(submit());

      expect(
        await screen.findByText("Informe o novo email"),
      ).toBeInTheDocument();
      expect(screen.getByText("Informe sua senha")).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should reject an invalid email", async () => {
      const onChange = mockChangeEmail();
      const user = await openForm();

      await fillAndSubmit(user, "not-an-email");

      expect(await screen.findByText("Email inválido")).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("successful request", () => {
    it("should send the new email with the password, show a toast and close the form", async () => {
      const onChange = mockChangeEmail();
      const user = await openForm();

      await fillAndSubmit(user);

      expect(
        await screen.findByText(
          "Enviamos um link para o novo email. Confirme por lá.",
        ),
      ).toBeInTheDocument();
      expect(onChange).toHaveBeenCalledExactlyOnceWith({ newEmail, password });
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("should disable the submit button while the link is being sent", async () => {
      mockChangeEmail({ responseDelay: 100 });
      const user = await openForm();

      await fillAndSubmit(user);

      expect(
        within(screen.getByRole("dialog")).getByRole("button", {
          name: "Enviando...",
        }),
      ).toBeDisabled();
      expect(
        await screen.findByText(
          "Enviamos um link para o novo email. Confirme por lá.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("failed request", () => {
    it.each([
      [400, "Senha incorreta ou o novo email é igual ao atual."],
      [409, "Esse email já está em uso."],
      [429, "Muitas tentativas. Aguarde um pouco e tente novamente."],
      [500, "Não foi possível trocar o email. Tente novamente."],
    ])("should keep the form open and show the right message on a %i response", async (status, message) => {
      mockChangeEmail({ status });
      const user = await openForm();

      await fillAndSubmit(user);

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should start clean when the form is opened again", async () => {
      mockChangeEmail({ status: 409 });
      const user = await openForm();
      await fillAndSubmit(user);
      expect(
        await screen.findByText("Esse email já está em uso."),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Cancelar" }));
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
      await user.click(screen.getByRole("button", { name: "Trocar email" }));

      expect(await screen.findByLabelText("Novo email")).toHaveValue("");
      expect(screen.getByLabelText("Sua senha")).toHaveValue("");
      expect(
        screen.queryByText("Esse email já está em uso."),
      ).not.toBeInTheDocument();
    });
  });
});
