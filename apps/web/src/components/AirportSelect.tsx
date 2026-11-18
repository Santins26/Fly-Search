import type { Airport } from "@viagens/shared";

const regionName = new Intl.DisplayNames(["pt-BR"], { type: "region" });
export const countryName = (code: string) => regionName.of(code) ?? code;

type Props = {
  name: string;
  label: string;
  airports: Airport[];
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
};

/** Select de aeroportos agrupado por país (e estado, quando houver). */
export function AirportSelect({ name, label, airports, defaultValue, required, placeholder }: Props) {
  const groups = new Map<string, Airport[]>();
  for (const a of airports) {
    const key = countryName(a.country);
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }

  return (
    <label className="field">
      {label}
      <select name={name} defaultValue={defaultValue ?? ""} required={required} className="input">
        <option value="">{placeholder ?? "Selecione"}</option>
        {[...groups].map(([country, list]) => (
          <optgroup key={country} label={country}>
            {list.map((a) => (
              <option key={a.iata} value={a.iata}>
                {a.city}
                {a.state ? ` (${a.state})` : ""} — {a.iata}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
