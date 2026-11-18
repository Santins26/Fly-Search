import { flightSearchQuerySchema, type FlightSearchResponse } from "@viagens/shared";
import { AirportSelect } from "@/components/AirportSelect";
import { EmptyBox, ErrorBox } from "@/components/ErrorBox";
import { api, ApiError } from "@/lib/api";
import { day, duration, firstParams, money, stops, time } from "@/lib/format";


type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SearchPage({ searchParams }: Props) {
  const sp = firstParams(await searchParams);
  const airports = await api.airports().catch(() => []);
  const today = new Date().toISOString().slice(0, 10);

  let result: FlightSearchResponse | null = null;
  let error: string | null = null;

  if (sp.origin || sp.destination || sp.departureDate) {
    // campos vazios do formulário (ex.: volta) chegam como "", então removemos
    const parsed = flightSearchQuerySchema.safeParse(
      Object.fromEntries(Object.entries(sp).filter(([, v]) => v)),
    );
    if (!parsed.success) {
      error = parsed.error.issues.map((i) => i.message).join("; ");
    } else {
      try {
        result = await api.searchFlights(parsed.data);
      } catch (e) {
        error = e instanceof ApiError ? e.message : "Erro inesperado na busca";
      }
    }
  }

  return (
    <div className="space-y-8">
      
      <section>
        <h1 className="text-2xl font-bold">Buscar voos</h1>
        <p className="mt-1 text-sm dark:text-white">
          A busca consulta a API de voos ao vivo e salva os preços encontrados para comparar depois.
        </p>
      </section>

      {airports.length === 0 && (
        <ErrorBox message="Nenhum aeroporto carregado. Confira se a API está rodando e se o seed foi executado." />
      )}

      {/* Formulário GET: os filtros vão para a URL, então a busca pode ser compartilhada */}
      <form className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <AirportSelect name="origin" label="Origem" airports={airports} defaultValue={sp.origin} required />
        </div>
        <div className="lg:col-span-2">
          <AirportSelect
            name="destination"
            label="Destino"
            airports={airports}
            defaultValue={sp.destination}
            required
          />
        </div>
        <label className="field">
          Ida
          <input type="date" name="departureDate" min={today} defaultValue={sp.departureDate} required className="input" />
        </label>
        <label className="field">
          Volta
          <input type="date" name="returnDate" min={today} defaultValue={sp.returnDate} className="input" />
        </label>
        <label className="field">
          Adultos
          <select name="adults" defaultValue={sp.adults ?? "1"} className="input">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Classe
          <select name="cabinClass" defaultValue={sp.cabinClass ?? "economy"} className="input">
            <option value="economy">Econômica</option>
            <option value="premium_economy">Premium</option>
            <option value="business">Executiva</option>
            <option value="first">Primeira</option>
          </select>
        </label>
        <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
          <button className="btn w-full lg:w-auto">Buscar</button>
        </div>
      </form>

      {error && <ErrorBox message={error} />}

      {result && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">
              {result.offers.length} {result.offers.length === 1 ? "oferta" : "ofertas"}
            </h2>
            <span className="text-xs dark:text-white">fonte: {result.provider}</span>
          </div>

          {result.offers.length === 0 ? (
            <EmptyBox>Nenhum voo encontrado para essa data.</EmptyBox>
          ) : (
            <ul className="space-y-3">
              {result.offers.map((o, i) => (
                <li key={o.id} className="card flex flex-wrap items-center gap-4">
                  <div className="min-w-40">
                    <div className="font-semibold">{o.airline.name}</div>
                    <div className="text-xs dark:text-white">{day(o.departureAt)}</div>
                  </div>
                  <div className="flex flex-1 items-center gap-3 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{time(o.departureAt)}</div>
                      <div className="text-xs dark:text-white">{o.origin}</div>
                    </div>
                    <div className="flex flex-1 flex-col items-center text-xs dark:text-white">
                      <span>{duration(o.durationMinutes)}</span>
                      <span className="my-1 h-px w-full bg-slate-300" />
                      <span>{stops(o.stops)}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{time(o.arrivalAt)}</div>
                      <div className="text-xs dark:text-white">{o.destination}</div>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    {i === 0 && (
                      <div className="text-xs font-semibold uppercase text-emerald-600">Mais barato</div>
                    )}
                    <div className="text-xl font-bold">{money(o.totalAmount, o.currency)}</div>
                    <div className="text-xs dark:text-white">{o.returnDepartureAt ? "ida e volta" : "só ida"}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
