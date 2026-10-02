import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite"],
  // Terms & conditions are read from terms/*.md at request time.
  outputFileTracingIncludes: { "/**": ["./terms/**/*.md"] },
};

export default nextConfig;
