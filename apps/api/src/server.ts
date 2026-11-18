import { buildApp } from "./app.js";
import { db, pool } from "./db/client.js";
import { env } from "./env.js";
import { createFlightProvider } from "./providers/index.js";

const app = await buildApp({ db, provider: createFlightProvider(), corsOrigin: env.CORS_ORIGIN });

const shutdown = async () => {
  await app.close();
  await pool.end();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`Docs em http://localhost:${env.PORT}/docs`);
