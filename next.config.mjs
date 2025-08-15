/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    // Increase the maximum body size for API routes
    maxBodySize: '50mb',
  },
  experimental: {
    // Enable server actions for better file handling
    serverActions: true,
  },
  // Configure API routes for larger uploads
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
