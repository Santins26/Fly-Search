import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const airports = pgTable(
  "airports",
  {
    iata: varchar("iata", { length: 3 }).primaryKey(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    state: varchar("state", { length: 3 }), // UF no Brasil, estado nos EUA; null onde não se aplica
    country: varchar("country", { length: 2 }).notNull(), // ISO 3166-1 alpha-2
  },
  (t) => [index("airports_country_state_idx").on(t.country, t.state)],
);

// Cada oferta retornada por uma busca vira um "snapshot" de preço.
// É isso que permite filtrar por país/estado/dia e, depois, montar histórico.
export const priceSnapshots = pgTable(
  "price_snapshots",
  {
    id: serial("id").primaryKey(),
    originIata: varchar("origin_iata", { length: 3 })
      .notNull()
      .references(() => airports.iata),
    destinationIata: varchar("destination_iata", { length: 3 })
      .notNull()
      .references(() => airports.iata),
    departureDate: date("departure_date").notNull(),
    returnDate: date("return_date"),
    airlineName: text("airline_name").notNull(),
    airlineIata: varchar("airline_iata", { length: 3 }),
    stops: integer("stops").notNull(),
    durationMinutes: integer("duration_minutes"),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    provider: varchar("provider", { length: 20 }).notNull(),
    providerOfferId: text("provider_offer_id"),
    fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("price_snapshots_route_idx").on(t.originIata, t.destinationIata, t.departureDate),
    index("price_snapshots_departure_idx").on(t.departureDate),
    index("price_snapshots_amount_idx").on(t.totalAmount),
  ],
);

export type AirportRow = typeof airports.$inferSelect;
export type NewPriceSnapshot = typeof priceSnapshots.$inferInsert;
