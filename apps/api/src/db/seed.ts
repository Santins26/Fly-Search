import { sql } from "drizzle-orm";
import { db, pool } from "./client.js";
import { airports } from "./schema.js";

type Seed = { iata: string; name: string; city: string; state: string | null; country: string };

const data: Seed[] = [
  // Brasil — capitais e principais aeroportos
  { iata: "BSB", name: "Aeroporto Internacional de Brasília", city: "Brasília", state: "DF", country: "BR" },
  { iata: "GRU", name: "Aeroporto Internacional de Guarulhos", city: "São Paulo", state: "SP", country: "BR" },
  { iata: "CGH", name: "Aeroporto de Congonhas", city: "São Paulo", state: "SP", country: "BR" },
  { iata: "VCP", name: "Aeroporto Internacional de Viracopos", city: "Campinas", state: "SP", country: "BR" },
  { iata: "GIG", name: "Aeroporto Internacional do Galeão", city: "Rio de Janeiro", state: "RJ", country: "BR" },
  { iata: "SDU", name: "Aeroporto Santos Dumont", city: "Rio de Janeiro", state: "RJ", country: "BR" },
  { iata: "CNF", name: "Aeroporto Internacional de Confins", city: "Belo Horizonte", state: "MG", country: "BR" },
  { iata: "VIX", name: "Aeroporto de Vitória", city: "Vitória", state: "ES", country: "BR" },
  { iata: "CWB", name: "Aeroporto Internacional Afonso Pena", city: "Curitiba", state: "PR", country: "BR" },
  { iata: "IGU", name: "Aeroporto Internacional de Foz do Iguaçu", city: "Foz do Iguaçu", state: "PR", country: "BR" },
  { iata: "FLN", name: "Aeroporto Internacional de Florianópolis", city: "Florianópolis", state: "SC", country: "BR" },
  { iata: "NVT", name: "Aeroporto de Navegantes", city: "Navegantes", state: "SC", country: "BR" },
  { iata: "POA", name: "Aeroporto Internacional Salgado Filho", city: "Porto Alegre", state: "RS", country: "BR" },
  { iata: "SSA", name: "Aeroporto Internacional de Salvador", city: "Salvador", state: "BA", country: "BR" },
  { iata: "REC", name: "Aeroporto Internacional do Recife", city: "Recife", state: "PE", country: "BR" },
  { iata: "FOR", name: "Aeroporto Internacional de Fortaleza", city: "Fortaleza", state: "CE", country: "BR" },
  { iata: "NAT", name: "Aeroporto Internacional de Natal", city: "Natal", state: "RN", country: "BR" },
  { iata: "JPA", name: "Aeroporto Internacional de João Pessoa", city: "João Pessoa", state: "PB", country: "BR" },
  { iata: "MCZ", name: "Aeroporto Internacional de Maceió", city: "Maceió", state: "AL", country: "BR" },
  { iata: "AJU", name: "Aeroporto de Aracaju", city: "Aracaju", state: "SE", country: "BR" },
  { iata: "SLZ", name: "Aeroporto Internacional de São Luís", city: "São Luís", state: "MA", country: "BR" },
  { iata: "THE", name: "Aeroporto de Teresina", city: "Teresina", state: "PI", country: "BR" },
  { iata: "BEL", name: "Aeroporto Internacional de Belém", city: "Belém", state: "PA", country: "BR" },
  { iata: "MAO", name: "Aeroporto Internacional de Manaus", city: "Manaus", state: "AM", country: "BR" },
  { iata: "MCP", name: "Aeroporto Internacional de Macapá", city: "Macapá", state: "AP", country: "BR" },
  { iata: "BVB", name: "Aeroporto Internacional de Boa Vista", city: "Boa Vista", state: "RR", country: "BR" },
  { iata: "PVH", name: "Aeroporto Internacional de Porto Velho", city: "Porto Velho", state: "RO", country: "BR" },
  { iata: "RBR", name: "Aeroporto Internacional de Rio Branco", city: "Rio Branco", state: "AC", country: "BR" },
  { iata: "PMW", name: "Aeroporto de Palmas", city: "Palmas", state: "TO", country: "BR" },
  { iata: "GYN", name: "Aeroporto de Goiânia", city: "Goiânia", state: "GO", country: "BR" },
  { iata: "CGB", name: "Aeroporto Internacional de Cuiabá", city: "Cuiabá", state: "MT", country: "BR" },
  { iata: "CGR", name: "Aeroporto Internacional de Campo Grande", city: "Campo Grande", state: "MS", country: "BR" },
  // Internacional
  { iata: "EZE", name: "Aeroporto Internacional Ezeiza", city: "Buenos Aires", state: null, country: "AR" },
  { iata: "SCL", name: "Aeroporto Internacional de Santiago", city: "Santiago", state: null, country: "CL" },
  { iata: "MVD", name: "Aeroporto Internacional de Carrasco", city: "Montevidéu", state: null, country: "UY" },
  { iata: "LIM", name: "Aeroporto Internacional Jorge Chávez", city: "Lima", state: null, country: "PE" },
  { iata: "MIA", name: "Miami International Airport", city: "Miami", state: "FL", country: "US" },
  { iata: "MCO", name: "Orlando International Airport", city: "Orlando", state: "FL", country: "US" },
  { iata: "JFK", name: "John F. Kennedy International Airport", city: "Nova York", state: "NY", country: "US" },
  { iata: "LIS", name: "Aeroporto Humberto Delgado", city: "Lisboa", state: null, country: "PT" },
  { iata: "MAD", name: "Aeroporto Adolfo Suárez Madrid-Barajas", city: "Madri", state: null, country: "ES" },
  { iata: "CDG", name: "Aeroporto Paris-Charles de Gaulle", city: "Paris", state: null, country: "FR" },
];

await db
  .insert(airports)
  .values(data)
  .onConflictDoUpdate({
    target: airports.iata,
    set: {
      name: sql`excluded.name`,
      city: sql`excluded.city`,
      state: sql`excluded.state`,
      country: sql`excluded.country`,
    },
  });

console.log(`✔ ${data.length} aeroportos inseridos/atualizados`);
await pool.end();
