import type { FlightSearchQuery, FlightSearchResponse } from "@viagens/shared";
import type { DB } from "../db/client.js";
import { priceSnapshots, type NewPriceSnapshot } from "../db/schema.js";
import type { FlightProvider } from "../providers/index.js";
import { findMissingAirports } from "./airports.js";

export class ValidationError extends Error {
  statusCode = 400;
}

/**
 * Busca ao vivo no provider e salva cada oferta como snapshot de preço.
 * O snapshot é o que alimenta a listagem filtrável (/prices).
 */
export async function searchFlights(
  db: DB,
  provider: FlightProvider,
  q: FlightSearchQuery,
): Promise<FlightSearchResponse> {
  const missing = await findMissingAirports(db, [q.origin, q.destination]);
  if (missing.length) {
    throw new ValidationError(`Aeroporto não cadastrado: ${missing.join(", ")}`);
  }

  const offers = await provider.search(q);
  const fetchedAt = new Date();

  if (offers.length) {
    const rows: NewPriceSnapshot[] = offers.map((o) => ({
      originIata: q.origin,
      destinationIata: q.destination,
      departureDate: q.departureDate,
      returnDate: q.returnDate ?? null,
      airlineName: o.airline.name,
      airlineIata: o.airline.iata,
      stops: o.stops,
      durationMinutes: o.durationMinutes,
      totalAmount: o.totalAmount,
      currency: o.currency,
      provider: provider.name,
      providerOfferId: o.id,
      fetchedAt,
    }));
    await db.insert(priceSnapshots).values(rows);
  }

  return { offers, provider: provider.name, fetchedAt: fetchedAt.toISOString() };
}
