const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long" });
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit" });
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function getMatchDateParts(date: Date) {
  const weekday = weekdayFormatter.format(date);

  return {
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    day: dayFormatter.format(date),
    month: monthFormatter.format(date).replace(".", ""),
    time: timeFormatter.format(date),
  };
}
