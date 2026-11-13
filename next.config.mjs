/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true,
    optimizeCss: true,
  },
  images: {
    deviceSizes: [640, 828, 1080, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75, 80],
    minimumCacheTTL: 31536000,
    remotePatterns: [
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

export default nextConfig;
