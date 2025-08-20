/** @type {import('next').NextConfig} */
const nextConfig = {
  // External packages for server components
  serverExternalPackages: ['puppeteer'],
  
  experimental: {
    // Remove React 19 specific features that cause issues
  },
  
  // Webpack configuration for Puppeteer compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
      });
    }
    
    // Handle canvas dependency issues
    config.resolve.alias.canvas = false;
    
    return config;
  },
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // API route timeout for long report generation
  async rewrites() {
    return [];
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
