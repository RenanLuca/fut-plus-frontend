import { describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { Route, Routes } from "react-router";
import { MatchActionsMenu } from "@/src/view/pages/MatchDetail/components/MatchActionsMenu";
import { queryKeys } from "@/src/app/lib/query-keys";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const matchUrl = `${API_URL}/groups/group-1/group-matches/match-1`;

function renderMenu() {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(
    <Routes>
      <Route
        path="/groups/:groupId/matches/:matchId"
        element={<MatchActionsMenu groupId="group-1" matchId="match-1" />}
      />
      <Route path="/groups/:groupId" element={<p>group page</p>} />
    </Routes>,
    { route: "/groups/group-1/matches/match-1" },
  );
  return { user, queryClient };
}

function mockDelete({
  status = 204,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onDelete = vi.fn();
  server.use(
    http.delete(matchUrl, async () => {
      await delay(responseDelay);
      onDelete();
      return new HttpResponse(null, { status });
    }),
  );
  return onDelete;
}

async function askToDelete(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Ações da partida" }));
  await user.click(await screen.findByRole("menuitem", { name: "Apagar partida" }));
  return screen.findByRole("alertdialog", { name: "Apagar partida?" });
}

describe("MatchActionsMenu", () => {
  it("should only offer to delete the match", async () => {
    const { user } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Ações da partida" }));

    expect(
      await screen.findByRole("menuitem", { name: "Apagar partida" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
  });

  it("should warn about what is lost and wait for confirmation", async () => {
    const onDelete = mockDelete();
    const { user } = renderMenu();

    const dialog = await askToDelete(user);

    expect(
      within(dialog).getByText(
        "Presenças, times e pagamentos ligados a esta partida serão apagados. Essa ação não pode ser desfeita.",
      ),
    ).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("should do nothing when the user cancels", async () => {
    const onDelete = mockDelete();
    const { user } = renderMenu();
    await askToDelete(user);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("should delete the match, refresh the lists and go back to the group", async () => {
    const onDelete = mockDelete();
    const { user, queryClient } = renderMenu();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    const removeQueries = vi.spyOn(queryClient, "removeQueries");
    const dialog = await askToDelete(user);

    await user.click(within(dialog).getByRole("button", { name: "Apagar partida" }));

    expect(await screen.findByText("group page")).toBeInTheDocument();
    expect(await screen.findByText("Partida apagada")).toBeInTheDocument();
    expect(onDelete).toHaveBeenCalledOnce();
    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.groupMatch("group-1", "match-1"),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.groupMatches("group-1"),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.upcomingMatch,
    });
  });

  it("should lock the dialog while the match is being deleted", async () => {
    mockDelete({ responseDelay: 100 });
    const { user } = renderMenu();
    const dialog = await askToDelete(user);

    await user.click(within(dialog).getByRole("button", { name: "Apagar partida" }));

    expect(within(dialog).getByRole("button", { name: "Aguarde..." })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(await screen.findByText("group page")).toBeInTheDocument();
  });

  it("should stay on the page and show an error toast when the API fails", async () => {
    mockDelete({ status: 500 });
    const { user } = renderMenu();
    const dialog = await askToDelete(user);

    await user.click(within(dialog).getByRole("button", { name: "Apagar partida" }));

    expect(
      await screen.findByText("Não foi possível apagar a partida. Tente novamente."),
    ).toBeInTheDocument();
    expect(screen.queryByText("group page")).not.toBeInTheDocument();
  });
});
