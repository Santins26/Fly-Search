import { env } from "../env.js";
import { DuffelProvider } from "./duffel.js";
import { MockProvider } from "./mock.js";
import type { FlightProvider } from "./types.js";

export function createFlightProvider(): FlightProvider {
  const choice = env.FLIGHT_PROVIDER ?? (env.DUFFEL_ACCESS_TOKEN ? "duffel" : "mock");

  if (choice === "duffel") {
    if (!env.DUFFEL_ACCESS_TOKEN) {
      throw new Error("FLIGHT_PROVIDER=duffel, mas DUFFEL_ACCESS_TOKEN não foi definido");
    }
    return new DuffelProvider(env.DUFFEL_ACCESS_TOKEN);
  }
  return new MockProvider();
}

export type { FlightProvider } from "./types.js";
export { ProviderError } from "./types.js";
