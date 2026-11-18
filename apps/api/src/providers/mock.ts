import type { FlightOffer, FlightSearchQuery } from "@viagens/shared";
import type { FlightProvider } from "./types.js";

const AIRLINES = [
  { name: "LATAM Airlines", iata: "LA" },
  { name: "GOL Linhas Aéreas", iata: "G3" },
  { name: "Azul Linhas Aéreas", iata: "AD" },
];

/** Gerador pseudoaleatório determinístico: mesma busca → mesmos preços. */
function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Provider falso para desenvolver sem token e para testes. */
export class MockProvider implements FlightProvider {
  readonly name = "mock";

  async search(q: FlightSearchQuery): Promise<FlightOffer[]> {
    const rand = seeded(`${q.origin}-${q.destination}-${q.departureDate}-${q.returnDate ?? ""}`);
    const count = Math.min(q.maxResults, 8);
    const base = 250 + rand() * 900;

    return Array.from({ length: count }, (_, i): FlightOffer => {
      const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)]!;
      const stops = rand() < 0.6 ? 0 : 1;
      const hour = 6 + Math.floor(rand() * 16);
      const duration = 90 + Math.floor(rand() * 120) + stops * 80;
      const dep = new Date(`${q.departureDate}T${String(hour).padStart(2, "0")}:00:00-03:00`);
      const arr = new Date(dep.getTime() + duration * 60_000);
      const price = (base + rand() * 400 - stops * 60) * q.adults * (q.returnDate ? 1.8 : 1);

      return {
        id: `mock_${q.origin}${q.destination}${q.departureDate}_${i}`,
        origin: q.origin,
        destination: q.destination,
        departureAt: dep.toISOString(),
        arrivalAt: arr.toISOString(),
        returnDepartureAt: q.returnDate ? `${q.returnDate}T18:00:00-03:00` : null,
        airline,
        stops,
        durationMinutes: duration,
        totalAmount: Math.round(price * 100) / 100,
        currency: "BRL",
      };
    }).sort((a, b) => a.totalAmount - b.totalAmount);
  }
}
