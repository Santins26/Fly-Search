import "server-only";
import type {
  Airport,
  FlightSearchQuery,
  FlightSearchResponse,
  PriceListResponse,
  PriceQuery,
} from "@viagens/shared";

const API_URL = process.env.API_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type Params = Record<string, string | number | undefined | null>;

async function get<T>(path: string, params: Params = {}): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const url = `${API_URL}${path}${qs.size ? `?${qs}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new ApiError("Não foi possível falar com a API. Ela está rodando?", 503);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
      issues?: { field: string; message: string }[];
    } | null;
    const detail = body?.issues?.map((i) => i.message).join("; ");
    throw new ApiError(detail || body?.error || `Erro ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  airports: (q: { country?: string; state?: string } = {}) => get<Airport[]>("/airports", q),
  searchFlights: (q: FlightSearchQuery) => get<FlightSearchResponse>("/flights/search", q),
  prices: (q: PriceQuery) => get<PriceListResponse>("/prices", q),
};
