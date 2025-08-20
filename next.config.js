/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Performance optimizations
    optimizePackageImports: ['ai', '@ai-sdk/react', '@ai-sdk/google'],
  },
  
  // Production optimizations
  output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,
  poweredByHeader: false,
  compress: true,
  
  // For Puppeteer compatibility
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

module.exports = nextConfig;
