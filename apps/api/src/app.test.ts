import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";
import type { DB } from "./db/client.js";
import { isoDurationToMinutes } from "./providers/duffel.js";
import { MockProvider } from "./providers/mock.js";

// Rotas de validação não chegam ao banco, então um DB vazio basta aqui.
const fakeDb = {} as DB;

describe("API", () => {
  it("GET /health", async () => {
    const app = await buildApp({ db: fakeDb, provider: new MockProvider(), logger: false });
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok", provider: "mock" });
  });

  it("rejeita busca com data inválida", async () => {
    const app = await buildApp({ db: fakeDb, provider: new MockProvider(), logger: false });
    const res = await app.inject({
      method: "GET",
      url: "/flights/search?origin=BSB&destination=GRU&departureDate=amanha",
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe("Parâmetros inválidos");
  });

  it("rejeita origem igual ao destino", async () => {
    const app = await buildApp({ db: fakeDb, provider: new MockProvider(), logger: false });
    const res = await app.inject({
      method: "GET",
      url: "/flights/search?origin=BSB&destination=bsb&departureDate=2026-12-20",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("isoDurationToMinutes", () => {
  it("converte durações ISO 8601", () => {
    expect(isoDurationToMinutes("PT2H35M")).toBe(155);
    expect(isoDurationToMinutes("P1DT3H")).toBe(1620);
    expect(isoDurationToMinutes(null)).toBeNull();
  });
});
