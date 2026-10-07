import type { NextConfig } from "next";

// Photos are served by the GETSET API (its /media path) and optimised here like local images.
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000");

// Settings that would break the live site fail the build instead: request paths are built from the bare origin,
// browsers on an HTTPS page can't call or download PDFs from an http:// API, and without the secret admin
// changes wait up to an hour.
if (apiUrl.pathname !== "/") {
  throw new Error(`NEXT_PUBLIC_API_URL must be the API's origin only, like https://api.teamgetset.com (no "${apiUrl.pathname}").`);
}
if (process.env.VERCEL && apiUrl.protocol !== "https:") {
  throw new Error("Set NEXT_PUBLIC_API_URL to the GETSET API's public https:// address in the Vercel project's environment variables.");
}
if (process.env.VERCEL_ENV === "production" && !process.env.REVALIDATE_SECRET) {
  throw new Error("Set REVALIDATE_SECRET (the same value as the API's) in the Vercel project's production environment variables.");
}

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
      // Itineraries are package pages; the word is common enough in shared links to keep it working.
      { source: "/itineraries", destination: "/packages", permanent: true },
      { source: "/itineraries/:slug", destination: "/packages/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
