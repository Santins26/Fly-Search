import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { ProviderError } from "./providers/index.js";
import { routes, type RouteDeps } from "./routes/index.js";
import { ValidationError } from "./services/flights.js";

export type AppOptions = RouteDeps & { corsOrigin?: string; logger?: boolean };

export async function buildApp({ corsOrigin, logger = true, ...deps }: AppOptions) {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: corsOrigin ?? true });
  await app.register(swagger, {
    openapi: { info: { title: "Viagens API", version: "0.1.0" } },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.setErrorHandler((err, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.status(400).send({
        error: "Parâmetros inválidos",
        issues: err.validation.map((v) => ({
          field: v.instancePath.replace(/^\//, ""),
          message: v.message,
        })),
      });
    }
    if (err instanceof ValidationError || err instanceof ProviderError) {
      return reply.status(err.statusCode).send({ error: err.message });
    }
    req.log.error(err);
    return reply.status(500).send({ error: "Erro interno" });
  });

  await app.register(routes, deps);
  return app;
}
