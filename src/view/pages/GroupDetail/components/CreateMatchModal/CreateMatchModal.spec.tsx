import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { CreateMatchModal } from ".";
import { queryKeys } from "@/src/app/lib/query-keys";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

const groupId = "group-1";
const createMatchUrl = `${API_URL}/groups/${groupId}/group-matches`;

function mockCreateMatch({
  status = 201,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onCreate = vi.fn();
  server.use(
    http.post(createMatchUrl, async ({ request }) => {
      await delay(responseDelay);
      onCreate(await request.json());
      return HttpResponse.json({}, { status });
    }),
  );
  return onCreate;
}

async function openForm() {
  const user = userEvent.setup();
  const { queryClient } = renderWithProviders(
    <CreateMatchModal groupId={groupId} />,
  );
  await user.click(screen.getByRole("button", { name: "Criar partida" }));
  await screen.findByRole("dialog");
  return { user, queryClient };
}

async function fillDateAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Data e horário"), "2030-05-17T20:30");
  await user.click(screen.getByRole("button", { name: "Criar" }));
}

describe("CreateMatchModal", () => {
  it("should open the form only after the user clicks the trigger", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CreateMatchModal groupId={groupId} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Criar partida" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Data e horário")).toBeInTheDocument();
  });

  it("should ask for the date and not call the API when it is empty", async () => {
    const onCreate = mockCreateMatch();
    const { user } = await openForm();

    await user.click(screen.getByRole("button", { name: "Criar" }));

    expect(
      await screen.findByText("Informe a data e o horário"),
    ).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("should send the date at the Brazil offset, refresh the matches and close the form", async () => {
    const onCreate = mockCreateMatch();
    const { user, queryClient } = await openForm();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    await fillDateAndSubmit(user);

    expect(await screen.findByText("Partida criada!")).toBeInTheDocument();
    expect(onCreate).toHaveBeenCalledExactlyOnceWith({
      matchDate: "2030-05-17T20:30:00-03:00",
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.groupMatches(groupId),
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("should disable the submit button while the match is being created", async () => {
    mockCreateMatch({ responseDelay: 100 });
    const { user } = await openForm();

    await fillDateAndSubmit(user);

    expect(screen.getByRole("button", { name: "Criando..." })).toBeDisabled();
    expect(await screen.findByText("Partida criada!")).toBeInTheDocument();
  });

  it.each([
    [409, "Já existe uma partida marcada para essa data nesse grupo"],
    [400, "A data da partida não pode ser no passado"],
    [500, "Não foi possível criar a partida. Tente novamente."],
  ])(
    "should keep the form open and show the right toast on a %i response",
    async (status, message) => {
      mockCreateMatch({ status });
      const { user } = await openForm();

      await fillDateAndSubmit(user);

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Criar" })).toBeEnabled();
    },
  );

  it("should clear the date when the form is opened again", async () => {
    const { user } = await openForm();
    await user.type(screen.getByLabelText("Data e horário"), "2030-05-17T20:30");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Criar partida" }));

    expect(await screen.findByLabelText("Data e horário")).toHaveValue("");
  });
});
