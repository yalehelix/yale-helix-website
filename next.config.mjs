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
      // Cache team images aggressively (1 year) - these rarely change
      {
        source: '/assets/img/team/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Expires',
            value: 'Thu, 31 Dec 2025 23:59:59 GMT'
          }
        ]
      },
      // Cache other images for 1 day with stale-while-revalidate
      {
        source: '/assets/img/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800'
          }
        ]
      },
      // Cache CSS and JS files for 1 week
      {
        source: '/assets/(css|js)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000'
          }
        ]
      },
      // Cache vendor files for 1 month
      {
        source: '/assets/vendor/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=31536000'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
