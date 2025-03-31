/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable strict mode for React
    reactStrictMode: true,
    // Enable experimental app directory
    experimental: {
      appDir: true,
    },
    // Configure image domains if needed
    images: {
      domains: [],
    },
  };
  
  module.exports = nextConfig;