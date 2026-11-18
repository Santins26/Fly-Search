import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node22",
  clean: true,
  // o pacote shared é TypeScript puro, então ele entra no bundle
  noExternal: ["@viagens/shared"],
});
