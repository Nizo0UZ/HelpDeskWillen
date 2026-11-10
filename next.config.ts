import type { NextConfig } from "next";

// URL do backend Express. Usada apenas no servidor do Next.js (não vai para o browser).
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // Proxy: o browser chama /api/... no próprio Next.js, que repassa ao backend.
  // Assim não há requisição cross-origin e o backend não precisa de CORS.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
