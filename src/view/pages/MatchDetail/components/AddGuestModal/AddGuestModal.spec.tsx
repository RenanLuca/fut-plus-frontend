import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { AddGuestModal } from "@/src/view/pages/MatchDetail/components/AddGuestModal";
import { queryKeys } from "@/src/app/lib/query-keys";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const guestsUrl = `${API_URL}/groups/group-1/group-matches/match-1/guests`;

type User = ReturnType<typeof userEvent.setup>;

function mockCreateGuest({
  status = 201,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onCreate = vi.fn();
  server.use(
    http.post(guestsUrl, async ({ request }) => {
      await delay(responseDelay);
      onCreate(await request.json());
      return HttpResponse.json(status === 201 ? { id: "guest-1" } : {}, { status });
    }),
  );
  return onCreate;
}

async function openForm() {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(
    <AddGuestModal groupId="group-1" matchId="match-1" />,
  );
  await user.click(screen.getByRole("button", { name: "Convidado" }));
  await screen.findByRole("dialog");
  return { user, queryClient };
}

async function fillGuest(user: User) {
  await user.type(screen.getByLabelText("Nome"), "Visitante");
  await user.click(screen.getByRole("radio", { name: "Atacante" }));
  await user.click(screen.getByRole("radio", { name: "Champions League" }));
}

describe("AddGuestModal", () => {
  it("should open the form only after the user clicks the trigger", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddGuestModal groupId="group-1" matchId="match-1" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Convidado" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Adicionar convidado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("O convidado entra já confirmado só nesta partida"),
    ).toBeInTheDocument();
  });

  it("should ask for the name, position and level and not call the API", async () => {
    const onCreate = mockCreateGuest();
    const { user } = await openForm();

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(
      await screen.findByText("Informe o nome do convidado"),
    ).toBeInTheDocument();
    expect(screen.getByText("Selecione a posição")).toBeInTheDocument();
    expect(screen.getByText("Selecione o nível")).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("should add the guest, refresh the match, show a toast and close the form", async () => {
    const onCreate = mockCreateGuest();
    const { user, queryClient } = await openForm();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    await fillGuest(user);
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByText("Convidado adicionado")).toBeInTheDocument();
    expect(onCreate).toHaveBeenCalledExactlyOnceWith({
      name: "Visitante",
      position: "STRIKER",
      rank: "CHAMPIONS_LEAGUE",
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.groupMatch("group-1", "match-1"),
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("should disable the button while the guest is being added", async () => {
    mockCreateGuest({ responseDelay: 100 });
    const { user } = await openForm();

    await fillGuest(user);
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("button", { name: "Adicionando..." })).toBeDisabled();
    expect(await screen.findByText("Convidado adicionado")).toBeInTheDocument();
  });

  it("should keep the form open and show an error toast when the API fails", async () => {
    mockCreateGuest({ status: 500 });
    const { user } = await openForm();

    await fillGuest(user);
    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(
      await screen.findByText("Não foi possível adicionar o convidado. Tente novamente."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveValue("Visitante");
  });
});
