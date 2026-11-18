import {
  airportQuerySchema,
  airportSchema,
  flightSearchQuerySchema,
  flightSearchResponseSchema,
  priceListResponseSchema,
  priceQuerySchema,
} from "@viagens/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import type { DB } from "../db/client.js";
import type { FlightProvider } from "../providers/index.js";
import { listAirports } from "../services/airports.js";
import { searchFlights } from "../services/flights.js";
import { listPrices } from "../services/prices.js";

export type RouteDeps = { db: DB; provider: FlightProvider };

export const routes: FastifyPluginAsyncZod<RouteDeps> = async (app, { db, provider }) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["infra"],
        response: { 200: z.object({ status: z.literal("ok"), provider: z.string() }) },
      },
    },
    async () => ({ status: "ok" as const, provider: provider.name }),
  );

  app.get(
    "/airports",
    {
      schema: {
        tags: ["airports"],
        summary: "Lista aeroportos, filtrando por país, estado ou texto",
        querystring: airportQuerySchema,
        response: { 200: z.array(airportSchema) },
      },
    },
    async (req) => listAirports(db, req.query),
  );

  app.get(
    "/flights/search",
    {
      schema: {
        tags: ["flights"],
        summary: "Busca preços ao vivo no provider e salva o resultado",
        querystring: flightSearchQuerySchema,
        response: { 200: flightSearchResponseSchema },
      },
    },
    async (req) => searchFlights(db, provider, req.query),
  );

  app.get(
    "/prices",
    {
      schema: {
        tags: ["prices"],
        summary: "Preços já coletados, com filtros por país, estado, data e valor",
        querystring: priceQuerySchema,
        response: { 200: priceListResponseSchema },
      },
    },
    async (req) => listPrices(db, req.query),
  );
};
