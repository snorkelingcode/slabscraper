
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for React
  reactStrictMode: true,
  
  // Configure webpack to handle Undici/Cheerio properly
  webpack: (config, { isServer }) => {
    // Force Undici to be transpiled
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'undici': false,
      };
    }
    
    return config;
  },
  
  // Configure image domains if needed
  images: {
    domains: [],
  },
};

module.exports = nextConfig;