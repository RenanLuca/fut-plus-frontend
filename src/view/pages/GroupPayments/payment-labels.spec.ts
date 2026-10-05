import { describe, expect, it } from "vitest";
import { makePaymentMock } from "@/__tests__/factories/payment";
import { formatRegisteredAt, paymentLabel } from "./payment-labels";

describe("formatRegisteredAt", () => {
  it("should write day and month in Brazil time", () => {
    expect(formatRegisteredAt("2026-10-05T15:00:00.000Z")).toBe("05/10");
  });

  it("should use the Brazil day when UTC is already on the next day", () => {
    // 01:00 UTC de 6/10 = 22:00 de 5/10 em Brasília
    expect(formatRegisteredAt("2026-10-06T01:00:00.000Z")).toBe("05/10");
  });
});

describe("paymentLabel", () => {
  it("should name the month for a monthly fee", () => {
    const payment = makePaymentMock({ matchId: null });

    expect(paymentLabel(payment, "outubro")).toBe("Mensalidade de outubro");
  });

  it("should name the match day for a one-off payment", () => {
    const payment = makePaymentMock({
      matchId: "match-1",
      period: "2026-10-02T00:00:00.000Z",
    });

    expect(paymentLabel(payment, "outubro")).toBe("Partida de 02/10");
  });

  it("should read the match day in UTC so it does not shift to the day before", () => {
    const payment = makePaymentMock({
      matchId: "match-1",
      period: "2026-10-02T00:00:00.000Z",
    });

    expect(paymentLabel(payment, "outubro")).not.toBe("Partida de 01/10");
  });
});
