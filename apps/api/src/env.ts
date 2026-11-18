import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().default("postgres://viagens:viagens@localhost:5432/viagens"),
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default("0.0.0.0"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  FLIGHT_PROVIDER: z
    .enum(["duffel", "mock", ""])
    .default("")
    .transform((v) => v || undefined),
  DUFFEL_ACCESS_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
