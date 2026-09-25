import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Esto apaga el optimizador y salva tu plan gratuito
  },
};

export default nextConfig;