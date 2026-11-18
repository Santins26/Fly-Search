import type { AirportQuery } from "@viagens/shared";
import { and, asc, eq, ilike, inArray, or, type SQL } from "drizzle-orm";
import type { DB } from "../db/client.js";
import { airports } from "../db/schema.js";

export async function listAirports(db: DB, q: AirportQuery) {
  const where: SQL[] = [];
  if (q.country) where.push(eq(airports.country, q.country));
  if (q.state) where.push(eq(airports.state, q.state));
  if (q.q) {
    const term = `%${q.q}%`;
    where.push(or(ilike(airports.iata, term), ilike(airports.city, term), ilike(airports.name, term))!);
  }

  return db
    .select()
    .from(airports)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(airports.country), asc(airports.state), asc(airports.city));
}

export async function findMissingAirports(db: DB, codes: string[]) {
  const rows = await db
    .select({ iata: airports.iata })
    .from(airports)
    .where(inArray(airports.iata, codes));
  const found = new Set(rows.map((r) => r.iata));
  return codes.filter((c) => !found.has(c));
}
