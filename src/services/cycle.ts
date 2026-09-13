import { Period, Settings } from "../types";
import { addDays, daysBetween } from "../utils/dates";
export function calculateCycle(
  periods: Period[],
  settings: Settings,
  date: string,
) {
  const sorted = [...periods]
    .filter((p) => p.start <= date)
    .sort((a, b) => a.start.localeCompare(b.start));
  const lengths = sorted
    .slice(1)
    .map((p, i) => daysBetween(sorted[i].start, p.start));
  const recent = lengths.slice(-6);
  const average = recent.length
    ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length)
    : settings.cycleLength;
  const durations = sorted
    .filter((p) => p.end)
    .slice(-6)
    .map((p) => daysBetween(p.start, p.end!) + 1);
  const periodLength = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : settings.periodLength;
  const last = sorted.at(-1);
  const next = last ? addDays(last.start, average) : null;
  const ovulation = next ? addDays(next, -14) : null;
  const fertileStart = ovulation ? addDays(ovulation, -5) : null;
  const fertileEnd = ovulation ? addDays(ovulation, 1) : null;
  const day = last ? daysBetween(last.start, date) + 1 : null;
  const bleeding = !!last && date >= last.start && date <= (last.end ?? date);
  const overdue = !!next && date > next;
  const phase = !last
    ? "unknown"
    : bleeding
      ? "menstrual"
      : overdue
        ? "unknown"
        : ovulation && date < addDays(ovulation, -1)
          ? "follicular"
          : ovulation && date <= addDays(ovulation, 1)
            ? "ovulatory"
            : "luteal";
  return {
    day,
    average,
    periodLength,
    lengths,
    sampleSize: recent.length,
    next,
    ovulation,
    fertileStart,
    fertileEnd,
    phase,
    overdue,
    variability:
      recent.length > 1 ? Math.max(...recent) - Math.min(...recent) : null,
    remaining: next ? daysBetween(date, next) : null,
  };
}
export function validatePeriod(period: Period, others: Period[], now: string) {
  if (
    period.start > now ||
    (period.end && (period.end < period.start || period.end > now))
  )
    return false;
  return !others.some(
    (p) =>
      p.id !== period.id &&
      period.start <= (p.end ?? now) &&
      p.start <= (period.end ?? now),
  );
}
