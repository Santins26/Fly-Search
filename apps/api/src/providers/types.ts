import type { FlightOffer, FlightSearchQuery } from "@viagens/shared";

/**
 * Qualquer fonte de preços (Duffel, mock, outra API no futuro) implementa esta interface.
 * As rotas e services nunca falam com a API externa diretamente.
 */
export interface FlightProvider {
  readonly name: string;
  search(query: FlightSearchQuery): Promise<FlightOffer[]>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
