import type { PriceListResponse, PriceQuery } from "@viagens/shared";
import { and, asc, count, desc, eq, gte, lte, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { DB } from "../db/client.js";
import { airports, priceSnapshots } from "../db/schema.js";

const o = alias(airports, "o");
const d = alias(airports, "d");

function buildWhere(q: PriceQuery): SQL | undefined {
  const w: SQL[] = [];
  if (q.origin) w.push(eq(priceSnapshots.originIata, q.origin));
  if (q.destination) w.push(eq(priceSnapshots.destinationIata, q.destination));
  if (q.originCountry) w.push(eq(o.country, q.originCountry));
  if (q.originState) w.push(eq(o.state, q.originState));
  if (q.destCountry) w.push(eq(d.country, q.destCountry));
  if (q.destState) w.push(eq(d.state, q.destState));
  if (q.from) w.push(gte(priceSnapshots.departureDate, q.from));
  if (q.to) w.push(lte(priceSnapshots.departureDate, q.to));
  if (q.minPrice !== undefined) w.push(gte(priceSnapshots.totalAmount, q.minPrice));
  if (q.maxPrice !== undefined) w.push(lte(priceSnapshots.totalAmount, q.maxPrice));
  return w.length ? and(...w) : undefined;
}

export async function listPrices(db: DB, q: PriceQuery): Promise<PriceListResponse> {
  const where = buildWhere(q);
  const dir = q.order === "asc" ? asc : desc;
  const sortCol = q.sort === "price" ? priceSnapshots.totalAmount : priceSnapshots.departureDate;

  const base = () =>
    db
      .select()
      .from(priceSnapshots)
      .innerJoin(o, eq(o.iata, priceSnapshots.originIata))
      .innerJoin(d, eq(d.iata, priceSnapshots.destinationIata))
      .where(where);

  const [rows, [totalRow]] = await Promise.all([
    base()
      .orderBy(dir(sortCol), desc(priceSnapshots.fetchedAt))
      .limit(q.pageSize)
      .offset((q.page - 1) * q.pageSize),
    db
      .select({ total: count() })
      .from(priceSnapshots)
      .innerJoin(o, eq(o.iata, priceSnapshots.originIata))
      .innerJoin(d, eq(d.iata, priceSnapshots.destinationIata))
      .where(where),
  ]);

  return {
    items: rows.map((r) => ({
      id: r.price_snapshots.id,
      origin: r.o,
      destination: r.d,
      departureDate: r.price_snapshots.departureDate,
      returnDate: r.price_snapshots.returnDate,
      airlineName: r.price_snapshots.airlineName,
      stops: r.price_snapshots.stops,
      totalAmount: r.price_snapshots.totalAmount,
      currency: r.price_snapshots.currency,
      fetchedAt: r.price_snapshots.fetchedAt.toISOString(),
    })),
    page: q.page,
    pageSize: q.pageSize,
    total: totalRow?.total ?? 0,
  };
}
