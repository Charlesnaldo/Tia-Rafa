/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [64, 128, 192, 256, 320, 384, 480],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "www.tiarafaela.com.br", pathname: "/api/product-image" },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
      {
        protocol: "https",
        hostname: "**.supabase.net",
      },
    ],
  },
};

// Production installs may omit devDependencies; load the analyzer only when requested.
const config = process.env.ANALYZE === "true"
  ? (await import("@next/bundle-analyzer")).default({ enabled: true, openAnalyzer: false })(nextConfig)
  : nextConfig;
export default config;
