/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    // Set max body size to match the 4MB file size limit in API routes
    maxBodySize: '4mb',
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
