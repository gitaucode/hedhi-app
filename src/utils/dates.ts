export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const dayNumber = (s: string) => Date.parse(`${s}T12:00:00Z`) / 86400000;
export const daysBetween = (a: string, b: string) =>
  Math.round(dayNumber(b) - dayNumber(a));
export const addDays = (s: string, n: number) =>
  new Date((dayNumber(s) + n) * 86400000).toISOString().slice(0, 10);
export function validDate(s: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    Number.isFinite(dayNumber(s)) &&
    addDays(s, 0) === s
  );
}
export const formatDate = (s: string, language = "en", long = false) =>
  new Date(`${s}T12:00:00`).toLocaleDateString(
    language === "sw" ? "sw-KE" : "en-KE",
    {
      day: "numeric",
      month: long ? "long" : "short",
      ...(long ? { year: "numeric" as const } : {}),
    },
  );
