import { Duffel, DuffelError } from "@duffel/api";
import type { FlightOffer, FlightSearchQuery } from "@viagens/shared";
import { ProviderError, type FlightProvider } from "./types.js";

/** Converte duração ISO 8601 ("PT2H35M", "P1DT3H") em minutos. */
export function isoDurationToMinutes(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(iso);
  if (!m) return null;
  const [, d = "0", h = "0", min = "0"] = m;
  return Number(d) * 1440 + Number(h) * 60 + Number(min);
}

export class DuffelProvider implements FlightProvider {
  readonly name = "duffel";
  private client: Duffel;

  constructor(token: string) {
    this.client = new Duffel({ token });
  }

  async search(q: FlightSearchQuery): Promise<FlightOffer[]> {
    const slices = [
      { origin: q.origin, destination: q.destination, departure_date: q.departureDate },
      ...(q.returnDate
        ? [{ origin: q.destination, destination: q.origin, departure_date: q.returnDate }]
        : []),
    ].map((s) => ({ ...s, departure_time: null, arrival_time: null }));

    try {
      const res = await this.client.offerRequests.create({
        slices,
        passengers: Array.from({ length: q.adults }, () => ({ type: "adult" as const })),
        cabin_class: q.cabinClass,
        return_offers: true,
        max_connections: 1,
      });

      const offers = res.data.offers ?? [];

      return offers
        .map((o): FlightOffer | null => {
          const outbound = o.slices[0];
          const inbound = o.slices[1];
          const first = outbound?.segments[0];
          const last = outbound?.segments.at(-1);
          if (!outbound || !first || !last) return null;

          return {
            id: o.id,
            origin: q.origin,
            destination: q.destination,
            departureAt: first.departing_at,
            arrivalAt: last.arriving_at,
            returnDepartureAt: inbound?.segments[0]?.departing_at ?? null,
            airline: { name: o.owner.name, iata: o.owner.iata_code ?? null },
            stops: outbound.segments.length - 1,
            durationMinutes: isoDurationToMinutes(outbound.duration),
            totalAmount: Number(o.total_amount),
            currency: o.total_currency,
          };
        })
        .filter((o): o is FlightOffer => o !== null)
        .sort((a, b) => a.totalAmount - b.totalAmount)
        .slice(0, q.maxResults);
    } catch (err) {
      if (err instanceof DuffelError) {
        const msg = err.errors?.[0]?.message ?? "Erro na API do Duffel";
        throw new ProviderError(msg, err.meta?.status === 422 ? 400 : 502);
      }
      throw err;
    }
  }
}
