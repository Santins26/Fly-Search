export const money = (value: number, currency = "BRL") =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);

export const time = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));

/** "2026-12-20" → "dom., 20 de dez." sem problema de fuso */
export const day = (isoDate: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${isoDate.slice(0, 10)}T00:00:00Z`));

export const duration = (minutes: number | null) =>
  minutes == null ? "—" : `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;

export const stops = (n: number) => (n === 0 ? "Direto" : n === 1 ? "1 parada" : `${n} paradas`);

/** searchParams do Next podem vir como string | string[]; ficamos só com a primeira. */
export function firstParams(sp: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  ) as Record<string, string | undefined>;
}
