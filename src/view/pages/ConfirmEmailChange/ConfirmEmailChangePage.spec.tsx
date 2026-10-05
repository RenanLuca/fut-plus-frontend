import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { ConfirmEmailChangePage } from "@/src/view/pages/ConfirmEmailChange";
import { queryKeys } from "@/src/app/lib/query-keys";
import { makeUserMock } from "@/__tests__/factories/user";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function renderConfirmEmailChangePage({
  route = "/confirm-email-change?token=token-123",
  authenticated = false,
} = {}) {
  return renderWithProviders(
    <Routes>
      <Route path="/confirm-email-change" element={<ConfirmEmailChangePage />} />
    </Routes>,
    { route, authenticated },
  );
}

function mockConfirmEmailChange({
  status = 200,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onConfirm = vi.fn();
  server.use(
    http.post(`${API_URL}/users/confirm-email-change`, async ({ request }) => {
      await delay(responseDelay);
      onConfirm(await request.json());
      return HttpResponse.json(status === 200 ? makeUserMock() : {}, { status });
    }),
  );
  return onConfirm;
}

describe("ConfirmEmailChange Page", () => {
  it("should show the invalid link screen when there is no token", () => {
    const onConfirm = mockConfirmEmailChange();

    renderConfirmEmailChangePage({ route: "/confirm-email-change" });

    expect(
      screen.getByRole("heading", { name: "Link inválido" }),
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("should show the progress message and no button while the token is being checked", async () => {
    mockConfirmEmailChange({ responseDelay: 100 });

    renderConfirmEmailChangePage();

    expect(
      screen.getByRole("heading", { name: "Confirmando seu novo email..." }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Email alterado!" }),
    ).toBeInTheDocument();
  });

  describe("when the change is confirmed", () => {
    it("should send the token once and say the email was updated", async () => {
      const onConfirm = mockConfirmEmailChange();

      renderConfirmEmailChangePage();

      expect(
        await screen.findByRole("heading", { name: "Email alterado!" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Seu email foi atualizado com sucesso."),
      ).toBeInTheDocument();
      expect(onConfirm).toHaveBeenCalledExactlyOnceWith({ token: "token-123" });
    });

    it("should refresh the cached current user", async () => {
      mockConfirmEmailChange();

      const { queryClient } = renderConfirmEmailChangePage();
      const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

      await waitFor(() =>
        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: queryKeys.me,
        }),
      );
    });

    it("should send a logged out user to the login", async () => {
      mockConfirmEmailChange();

      renderConfirmEmailChangePage({ authenticated: false });

      expect(
        await screen.findByRole("link", { name: "Ir para o login" }),
      ).toHaveAttribute("href", "/");
    });

    it("should send a logged in user to the profile", async () => {
      mockConfirmEmailChange();

      renderConfirmEmailChangePage({ authenticated: true });

      expect(
        await screen.findByRole("link", { name: "Ir para o perfil" }),
      ).toHaveAttribute("href", "/profile");
    });
  });

  describe("when the change is refused", () => {
    it("should say the email is already taken on a 409", async () => {
      mockConfirmEmailChange({ status: 409 });

      renderConfirmEmailChangePage();

      expect(
        await screen.findByRole("heading", { name: "Email indisponível" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Outra conta já está usando esse email/),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Ir para o login" })).toBeInTheDocument();
    });

    it.each([400, 500])(
      "should show the invalid link screen on a %i",
      async (status) => {
        mockConfirmEmailChange({ status });

        renderConfirmEmailChangePage();

        expect(
          await screen.findByRole("heading", { name: "Link inválido" }),
        ).toBeInTheDocument();
      },
    );
  });
});
