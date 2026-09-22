import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'perfumeriafirst.com',
      },
      {
        protocol: 'https',
        hostname: 'www.falabella.com.co', // <-- Aquí agregamos Falabella
      }
    ],
  },
};

export default nextConfig;