import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tesseract.js resolves its worker script from a real node_modules path at
  // runtime — bundling it breaks that resolution, so it must run via native
  // `require` instead (same reason `sharp` is auto-externalized by Next).
  serverExternalPackages: ["tesseract.js"],
};

export default nextConfig;
