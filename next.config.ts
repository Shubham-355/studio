import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory otherwise gets picked as the workspace root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
