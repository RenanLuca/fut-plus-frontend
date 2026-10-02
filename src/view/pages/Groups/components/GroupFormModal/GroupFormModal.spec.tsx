import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { GroupFormModal } from ".";
import { makeGroupMock } from "@/__tests__/factories/group";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

type User = ReturnType<typeof userEvent.setup>;

async function selectOption(user: User, field: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: field }));
  await user.click(await screen.findByRole("option", { name: option }));
}

async function fillCreateForm(user: User) {
  await user.type(screen.getByLabelText("Nome do grupo"), "Pelada de quinta");
  await selectOption(user, "Dia da semana", "Quinta");
  await user.type(screen.getByLabelText("Horário"), "20:00");
  await selectOption(user, "Frequência", "Mensal");
  await user.type(screen.getByLabelText("Valor por pessoa"), "50");
  await user.click(screen.getByRole("radio", { name: "Bola de Ouro" }));
}

const createdGroupPayload = {
  name: "Pelada de quinta",
  weekday: "THURSDAY",
  hour: "20:00",
  frequency: "MONTHLY",
  valuePerUser: 50,
  rank: "BALLON_DOR",
};

function mockCreateGroup({
  status = 201,
  responseDelay = 0,
}: { status?: number; responseDelay?: number } = {}) {
  const onCreate = vi.fn();
  server.use(
    http.post(`${API_URL}/groups`, async ({ request }) => {
      await delay(responseDelay);
      onCreate(await request.json());
      return HttpResponse.json(status === 201 ? makeGroupMock() : {}, {
        status,
      });
    }),
  );
  return onCreate;
}

async function openCreateSheet() {
  const user = userEvent.setup();
  renderWithProviders(<GroupFormModal mode="create" />);
  await user.click(screen.getByRole("button", { name: "Criar grupo" }));
  await screen.findByRole("dialog");
  return user;
}

describe("GroupFormModal", () => {
  describe("create mode", () => {
    it("should open the form only after the user clicks the trigger", async () => {
      const user = userEvent.setup();
      renderWithProviders(<GroupFormModal mode="create" />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Criar grupo" }));

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText("Nome do grupo")).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: "Bola de Ouro" })).toBeVisible();
    });

    it("should show the required-field errors and not call the API", async () => {
      const onCreate = mockCreateGroup();
      const user = await openCreateSheet();

      await user.click(screen.getByRole("button", { name: "Criar" }));

      expect(
        await screen.findByText("Informe o nome do grupo"),
      ).toBeInTheDocument();
      expect(screen.getByText("Selecione o dia da semana")).toBeInTheDocument();
      expect(screen.getByText("Informe o horário")).toBeInTheDocument();
      expect(screen.getByText("Selecione a frequência")).toBeInTheDocument();
      expect(screen.getByText("Selecione seu nível")).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("should ask for the value in Portuguese when it is empty", async () => {
      const user = await openCreateSheet();

      await user.click(screen.getByRole("button", { name: "Criar" }));

      expect(await screen.findByText("Informe um valor")).toBeInTheDocument();
    });

    it("should reject a value of zero", async () => {
      const onCreate = mockCreateGroup();
      const user = await openCreateSheet();

      await fillCreateForm(user);
      await user.clear(screen.getByLabelText("Valor por pessoa"));
      await user.type(screen.getByLabelText("Valor por pessoa"), "0");
      await user.click(screen.getByRole("button", { name: "Criar" }));

      expect(await screen.findByText("Informe um valor válido")).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it("should create the group, show a toast and close the form", async () => {
      const onCreate = mockCreateGroup();
      const user = await openCreateSheet();

      await fillCreateForm(user);
      await user.click(screen.getByRole("button", { name: "Criar" }));

      expect(await screen.findByText("Grupo criado!")).toBeInTheDocument();
      expect(onCreate).toHaveBeenCalledExactlyOnceWith(createdGroupPayload);
      await waitFor(() =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
      );
    });

    it("should disable the submit button while the group is being created", async () => {
      mockCreateGroup({ responseDelay: 100 });
      const user = await openCreateSheet();

      await fillCreateForm(user);
      await user.click(screen.getByRole("button", { name: "Criar" }));

      expect(screen.getByRole("button", { name: "Criando..." })).toBeDisabled();
      expect(await screen.findByText("Grupo criado!")).toBeInTheDocument();
    });

    it("should keep the form open and show an error toast when the API fails", async () => {
      mockCreateGroup({ status: 500 });
      const user = await openCreateSheet();

      await fillCreateForm(user);
      await user.click(screen.getByRole("button", { name: "Criar" }));

      expect(
        await screen.findByText(
          "Não foi possível criar o grupo. Tente novamente.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Criar" })).toBeEnabled();
    });
  });

  describe("edit mode", () => {
    const group = makeGroupMock({
      id: "group-1",
      name: "Pelada de sexta",
      weekday: "FRIDAY",
      hour: "20:00",
      frequency: "EVENTUAL",
      valuePerUser: 20,
    });

    function renderEditForm() {
      const onOpenChange = vi.fn();
      renderWithProviders(
        <GroupFormModal
          mode="edit"
          group={group}
          open
          onOpenChange={onOpenChange}
        />,
      );
      return onOpenChange;
    }

    it("should fill the form with the group data and hide the rank field", async () => {
      renderEditForm();

      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Editar grupo" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Nome do grupo")).toHaveValue(group.name);
      expect(screen.getByLabelText("Horário")).toHaveValue(group.hour);
      expect(screen.getByRole("combobox", { name: "Dia da semana" })).toHaveTextContent(
        "Sexta",
      );
      expect(screen.getByRole("combobox", { name: "Frequência" })).toHaveTextContent(
        "Eventual",
      );
      expect(screen.queryByText("Seu nível")).not.toBeInTheDocument();
    });

    it("should update the group without sending the rank and close the form", async () => {
      const onUpdate = vi.fn();
      server.use(
        http.put(`${API_URL}/groups/${group.id}`, async ({ request }) => {
          onUpdate(await request.json());
          return HttpResponse.json(group);
        }),
      );
      const user = userEvent.setup();
      const onOpenChange = renderEditForm();

      const name = await screen.findByLabelText("Nome do grupo");
      await user.clear(name);
      await user.type(name, "Pelada renomeada");
      await user.click(screen.getByRole("button", { name: "Salvar" }));

      expect(await screen.findByText("Grupo atualizado!")).toBeInTheDocument();
      expect(onUpdate).toHaveBeenCalledExactlyOnceWith({
        name: "Pelada renomeada",
        weekday: "FRIDAY",
        hour: "20:00",
        frequency: "EVENTUAL",
        valuePerUser: 20,
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
