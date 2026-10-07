import type { NextConfig } from "next";

// Photos are served by the GETSET API (its /media path) and optimised here like local images.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smaller photos), WebP fallback. Encoded once, then cached.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", "") as "http" | "https",
        hostname: apiUrl.hostname,
        ...(apiUrl.port && { port: apiUrl.port }),
        pathname: "/media/**",
      },
    ],
    // The local development API runs on localhost, which the optimiser blocks by default.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(apiUrl.hostname),
  },
  async redirects() {
    // Destination pages moved to /destinations/<slug>; keep the old addresses working.
    return [
      { source: "/dubai", destination: "/destinations/dubai", permanent: true },
      { source: "/uae", destination: "/destinations/uae", permanent: true },
    ];
  },
};

export default nextConfig;
