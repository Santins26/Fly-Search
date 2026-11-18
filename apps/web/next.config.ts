import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // o pacote shared é TypeScript puro e precisa ser transpilado pelo Next
  transpilePackages: ["@viagens/shared"],
};

export default nextConfig;
