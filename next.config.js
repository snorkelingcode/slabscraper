
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for React
  reactStrictMode: true,
  // Experimental features not needed in newer Next.js versions
  experimental: {
    // App directory is stable in newer Next.js versions, no need to mark as experimental
  },
  // Configure image domains if needed
  images: {
    domains: [],
  },
};

module.exports = nextConfig;