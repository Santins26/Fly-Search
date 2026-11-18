import { priceQuerySchema, type PriceListResponse } from "@viagens/shared";
import Link from "next/link";
import { AirportSelect, countryName } from "@/components/AirportSelect";
import { AutoSubmitSelect } from "@/components/AutoSubmitSelect";
import { EmptyBox, ErrorBox } from "@/components/ErrorBox";
import { api, ApiError } from "@/lib/api";
import { day, firstParams, money, stops } from "@/lib/format";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PricesPage({ searchParams }: Props) {
  const sp = firstParams(await searchParams);
  const airports = await api.airports().catch(() => []);

  const countries = [...new Set(airports.map((a) => a.country))].sort((a, b) =>
    countryName(a).localeCompare(countryName(b), "pt-BR"),
  );
  const states = [
    ...new Set(
      airports.filter((a) => a.country === sp.destCountry && a.state).map((a) => a.state!),
    ),
  ].sort();

  let data: PriceListResponse | null = null;
  let error: string | null = null;

  // Campos vazios do formulário chegam como "", então removemos antes de validar
  const cleaned = Object.fromEntries(Object.entries(sp).filter(([, v]) => v));
  const parsed = priceQuerySchema.safeParse(cleaned);
  if (!parsed.success) {
    error = parsed.error.issues.map((i) => i.message).join("; ");
  } else {
    try {
      data = await api.prices(parsed.data);
    } catch (e) {
      error = e instanceof ApiError ? e.message : "Erro ao carregar preços";
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const pageHref = (page: number) => `/precos?${new URLSearchParams({ ...cleaned, page: String(page) })}`;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold">Preços coletados</h1>
        <p className="mt-1 text-sm text-slate-600">
          Todos os preços já encontrados nas buscas. Filtre por país, estado, período e valor.
        </p>
      </section>

      <form className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AirportSelect name="origin" label="Saindo de" airports={airports} defaultValue={sp.origin} placeholder="Qualquer origem" />
        <label className="field">
          País de destino
          <AutoSubmitSelect name="destCountry" defaultValue={sp.destCountry ?? ""} resetFields={["destState"]} className="input">
            <option value="">Qualquer país</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {countryName(c)}
              </option>
            ))}
          </AutoSubmitSelect>
        </label>
        <label className="field">
          Estado de destino
          <select
            name="destState"
            defaultValue={sp.destState ?? ""}
            disabled={states.length === 0}
            className="input disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">{sp.destCountry ? "Qualquer estado" : "Escolha um país"}</option>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Preço máximo (R$)
          <input type="number" name="maxPrice" min={0} step={50} defaultValue={sp.maxPrice} className="input" />
        </label>
        <label className="field">
          Ida a partir de
          <input type="date" name="from" defaultValue={sp.from} className="input" />
        </label>
        <label className="field">
          Ida até
          <input type="date" name="to" defaultValue={sp.to} className="input" />
        </label>
        <label className="field">
          Ordenar por
          <select name="sort" defaultValue={`${sp.sort ?? "price"}`} className="input">
            <option value="price">Menor preço</option>
            <option value="date">Data da viagem</option>
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="btn flex-1">Filtrar</button>
          <Link href="/precos" className="btn bg-slate-200 text-slate-700 hover:bg-slate-300">
            Limpar
          </Link>
        </div>
      </form>

      {error && <ErrorBox message={error} />}

      {data && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{data.total} resultados</h2>

          {data.items.length === 0 ? (
            <EmptyBox>
              Nenhum preço com esses filtros. <Link href="/" className="text-brand-600 underline">Faça uma busca</Link> para
              coletar mais.
            </EmptyBox>
          ) : (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Trecho</th>
                    <th className="px-4 py-3">Destino</th>
                    <th className="px-4 py-3">Ida</th>
                    <th className="px-4 py-3">Cia.</th>
                    <th className="px-4 py-3">Paradas</th>
                    <th className="px-4 py-3 text-right">Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        {p.origin.iata} → {p.destination.iata}
                        {p.returnDate && <span className="ml-1 text-xs text-slate-400">(ida e volta)</span>}
                      </td>
                      <td className="px-4 py-3">
                        {p.destination.city}
                        {p.destination.state ? `/${p.destination.state}` : ""}
                        <span className="text-slate-400"> · {countryName(p.destination.country)}</span>
                      </td>
                      <td className="px-4 py-3">{day(p.departureDate)}</td>
                      <td className="px-4 py-3">{p.airlineName}</td>
                      <td className="px-4 py-3">{stops(p.stops)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{money(p.totalAmount, p.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-4 text-sm">
              {data.page > 1 ? <Link href={pageHref(data.page - 1)} className="text-brand-600">← Anterior</Link> : <span />}
              <span className="text-slate-500">
                Página {data.page} de {totalPages}
              </span>
              {data.page < totalPages ? <Link href={pageHref(data.page + 1)} className="text-brand-600">Próxima →</Link> : <span />}
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
