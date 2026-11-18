import { z } from "zod";

// ---------- Helpers ----------

const iata = z
  .string()
  .trim()
  .length(3, "Código IATA deve ter 3 letras")
  .transform((v) => v.toUpperCase());

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato YYYY-MM-DD");

const countryCode = z
  .string()
  .trim()
  .length(2, "Use o código do país com 2 letras (ex.: BR)")
  .transform((v) => v.toUpperCase());

const stateCode = z
  .string()
  .trim()
  .min(2)
  .max(3)
  .transform((v) => v.toUpperCase());

// ---------- Aeroportos ----------

export const airportSchema = z.object({
  iata: z.string(),
  name: z.string(),
  city: z.string(),
  state: z.string().nullable(),
  country: z.string(),
});
export type Airport = z.infer<typeof airportSchema>;

export const airportQuerySchema = z.object({
  country: countryCode.optional(),
  state: stateCode.optional(),
  q: z.string().trim().min(1).optional(),
});
export type AirportQuery = z.infer<typeof airportQuerySchema>;

// ---------- Busca ao vivo de voos ----------

export const cabinClasses = ["economy", "premium_economy", "business", "first"] as const;

export const flightSearchQuerySchema = z
  .object({
    origin: iata,
    destination: iata,
    departureDate: isoDate,
    returnDate: isoDate.optional(),
    adults: z.coerce.number().int().min(1).max(9).default(1),
    cabinClass: z.enum(cabinClasses).default("economy"),
    maxResults: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine((q) => q.origin !== q.destination, {
    message: "Origem e destino precisam ser diferentes",
    path: ["destination"],
  })
  .refine((q) => !q.returnDate || q.returnDate >= q.departureDate, {
    message: "A volta precisa ser depois da ida",
    path: ["returnDate"],
  });
export type FlightSearchQuery = z.infer<typeof flightSearchQuerySchema>;

export const flightOfferSchema = z.object({
  id: z.string(),
  origin: z.string(),
  destination: z.string(),
  departureAt: z.string(),
  arrivalAt: z.string(),
  returnDepartureAt: z.string().nullable(),
  airline: z.object({ name: z.string(), iata: z.string().nullable() }),
  stops: z.number().int(),
  durationMinutes: z.number().int().nullable(),
  totalAmount: z.number(),
  currency: z.string(),
});
export type FlightOffer = z.infer<typeof flightOfferSchema>;

export const flightSearchResponseSchema = z.object({
  offers: z.array(flightOfferSchema),
  provider: z.string(),
  fetchedAt: z.string(),
});
export type FlightSearchResponse = z.infer<typeof flightSearchResponseSchema>;

// ---------- Histórico de preços (filtros por país/estado/dia) ----------

export const priceQuerySchema = z.object({
  origin: iata.optional(),
  destination: iata.optional(),
  originCountry: countryCode.optional(),
  originState: stateCode.optional(),
  destCountry: countryCode.optional(),
  destState: stateCode.optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["price", "date"]).default("price"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PriceQuery = z.infer<typeof priceQuerySchema>;

export const priceSnapshotSchema = z.object({
  id: z.number().int(),
  origin: airportSchema,
  destination: airportSchema,
  departureDate: z.string(),
  returnDate: z.string().nullable(),
  airlineName: z.string(),
  stops: z.number().int(),
  totalAmount: z.number(),
  currency: z.string(),
  fetchedAt: z.string(),
});
export type PriceSnapshot = z.infer<typeof priceSnapshotSchema>;

export const priceListResponseSchema = z.object({
  items: z.array(priceSnapshotSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});
export type PriceListResponse = z.infer<typeof priceListResponseSchema>;
