import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(dirname, "../.."),
  transpilePackages: [
    "@tutela/types",
    "@tutela/config",
    "@tutela/validation",
    "@tutela/condition-engine",
    "@tutela/txline-adapter",
    "@tutela/solana-client"
  ]
};

export default nextConfig;
