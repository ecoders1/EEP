/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow build to succeed even if env vars aren't set (Vercel sets them at runtime)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
