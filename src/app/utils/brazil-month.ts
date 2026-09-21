const BRAZIL_UTC_OFFSET_HOURS = 3;

export type YearMonth = {
  year: number;
  month: number;
};

export function getCurrentBrazilMonth(): YearMonth {
  const brazilNow = new Date(
    Date.now() - BRAZIL_UTC_OFFSET_HOURS * 60 * 60 * 1000,
  );
  return {
    year: brazilNow.getUTCFullYear(),
    month: brazilNow.getUTCMonth() + 1,
  };
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function isSameMonth(a: YearMonth, b: YearMonth) {
  return a.year === b.year && a.month === b.month;
}

export function formatMonthLong({ year, month }: YearMonth) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatMonthName({ year, month }: YearMonth) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
