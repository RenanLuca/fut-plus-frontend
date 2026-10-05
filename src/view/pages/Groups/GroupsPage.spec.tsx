import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { GroupsPage } from "@/src/view/pages/Groups";
import { makeGroupMock } from "@/__tests__/factories/group";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function mockGroups(groups = [makeGroupMock({ id: "group-1", name: "Pelada de sexta" })]) {
  server.use(http.get(`${API_URL}/groups`, () => HttpResponse.json(groups)));
}

describe("Groups Page", () => {
  it("should show the title and the create button", async () => {
    mockGroups();

    renderWithProviders(<GroupsPage />);

    expect(
      screen.getByRole("heading", { name: "Meus grupos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar grupo" })).toBeInTheDocument();
    expect(await screen.findByText("Pelada de sexta")).toBeInTheDocument();
  });

  it("should show the loading placeholder until the groups arrive", async () => {
    server.use(
      http.get(`${API_URL}/groups`, async () => {
        await delay(100);
        return HttpResponse.json([makeGroupMock({ name: "Pelada de sexta" })]);
      }),
    );

    renderWithProviders(<GroupsPage />);

    expect(
      screen.getByRole("status", { name: "GroupGridLoading" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Pelada de sexta")).toBeInTheDocument();
    expect(
      screen.queryByRole("status", { name: "GroupGridLoading" }),
    ).not.toBeInTheDocument();
  });

  it("should list every group of the user", async () => {
    mockGroups([
      makeGroupMock({ id: "group-1", name: "Pelada de sexta" }),
      makeGroupMock({ id: "group-2", name: "Racha de domingo" }),
    ]);

    renderWithProviders(<GroupsPage />);

    const list = await screen.findByRole("list", { name: "GroupGridList" });
    expect(within(list).getAllByRole("link")).toHaveLength(2);
    expect(within(list).getByText("Racha de domingo")).toBeInTheDocument();
  });

  it("should show the empty state when the user has no groups", async () => {
    mockGroups([]);

    renderWithProviders(<GroupsPage />);

    expect(
      await screen.findByRole("status", { name: "GroupGridEmpty" }),
    ).toBeInTheDocument();
  });

  it("should show the new group in the list after creating it", async () => {
    let groups = [makeGroupMock({ id: "group-1", name: "Pelada de sexta" })];
    server.use(
      http.get(`${API_URL}/groups`, () => HttpResponse.json(groups)),
      http.post(`${API_URL}/groups`, async ({ request }) => {
        const payload = (await request.json()) as { name: string };
        const created = makeGroupMock({ id: "group-2", name: payload.name });
        groups = [...groups, created];
        return HttpResponse.json(created, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<GroupsPage />);
    expect(await screen.findByText("Pelada de sexta")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Criar grupo" }));
    await screen.findByRole("dialog");
    await user.type(screen.getByLabelText("Nome do grupo"), "Racha de domingo");
    await user.click(screen.getByRole("combobox", { name: "Dia da semana" }));
    await user.click(await screen.findByRole("option", { name: "Domingo" }));
    await user.type(screen.getByLabelText("Horário"), "18:00");
    await user.click(screen.getByRole("combobox", { name: "Frequência" }));
    await user.click(await screen.findByRole("option", { name: "Eventual" }));
    await user.type(screen.getByLabelText("Valor por pessoa"), "15");
    await user.click(screen.getByRole("radio", { name: "Brasileirão" }));
    await user.click(screen.getByRole("button", { name: "Criar" }));

    expect(await screen.findByText("Grupo criado!")).toBeInTheDocument();
    expect(await screen.findByText("Racha de domingo")).toBeInTheDocument();
    expect(screen.getByText("Pelada de sexta")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
