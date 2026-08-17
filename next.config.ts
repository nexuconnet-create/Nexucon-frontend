import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
  trailingSlash: true,
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    // IGNORE process.env entirely because invalid values cause rewrite loops
    const backendUrl = isProd ? 'https://nexucon-backend.onrender.com' : 'http://127.0.0.1:8000';
    
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/v1/:path*`,
      }
    ];
  },
};

export default nextConfig;
