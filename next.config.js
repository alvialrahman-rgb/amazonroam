/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Ignore TypeScript errors during build for prototype
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build for prototype
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
