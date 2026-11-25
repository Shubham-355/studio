import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory otherwise gets picked as the workspace root.
  turbopack: {
    root: __dirname,
  },
  // Stamps each build, so plates a returning visitor's browser kept from an older build are never reused.
  env: {
    NEXT_PUBLIC_PLATES: String(Date.now()),
  },
};

export default nextConfig;
