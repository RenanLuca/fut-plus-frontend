import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { useMyMembership } from "./useMyMembership";
import { makeGroupMemberMock } from "@/__tests__/factories/groupMember";
import { API_URL } from "@/__tests__/mocks/handlers";
import { server } from "@/__tests__/mocks/server";
import { renderWithProviders } from "@/__tests__/utils/renderWithProviders";

function MembershipProbe({ groupId }: { groupId: string }) {
  const { type, isLoading } = useMyMembership(groupId);
  return <p>{isLoading ? "loading" : `type: ${type ?? "none"}`}</p>;
}

function mockMembers(
  members: ReturnType<typeof makeGroupMemberMock>[],
  responseDelay = 0,
) {
  const onRequest = vi.fn();
  server.use(
    http.get(`${API_URL}/groups/group-1/group-members`, async () => {
      onRequest();
      await delay(responseDelay);
      return HttpResponse.json(members);
    }),
  );
  return onRequest;
}

describe("useMyMembership", () => {
  it.each(["OWNER", "MONTHLY", "DAILY"] as const)(
    "should report the %s type of the logged user",
    async (type) => {
      mockMembers([
        makeGroupMemberMock({ userId: "user-2", name: "Carlos" }),
        makeGroupMemberMock({ userId: "user-logado", name: "Renan", type }),
      ]);

      renderWithProviders(<MembershipProbe groupId="group-1" />);

      expect(await screen.findByText(`type: ${type}`)).toBeInTheDocument();
    },
  );

  it("should have no type when the logged user is not in the group", async () => {
    mockMembers([makeGroupMemberMock({ userId: "user-2" })]);

    renderWithProviders(<MembershipProbe groupId="group-1" />);

    expect(await screen.findByText("type: none")).toBeInTheDocument();
  });

  it("should report loading until the members arrive", async () => {
    mockMembers([makeGroupMemberMock({ userId: "user-logado", type: "MONTHLY" })], 100);

    renderWithProviders(<MembershipProbe groupId="group-1" />);

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(await screen.findByText("type: MONTHLY")).toBeInTheDocument();
  });

  it("should not ask for members without a group id", async () => {
    const onRequest = mockMembers([]);

    renderWithProviders(<MembershipProbe groupId="" />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onRequest).not.toHaveBeenCalled();
  });
});
