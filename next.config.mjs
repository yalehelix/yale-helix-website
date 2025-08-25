/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // CORS for API routes (adjust origin as needed)
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },

      // Cache vendor files for 1 month (+ long SWR)
      {
        source: '/assets/vendor/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=31536000' },
        ],
      },

      // Team images: very long, immutable (put BEFORE the general images rule)
      {
        source: '/assets/img/team/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // Other images for 1 day with SWR
      {
        // Exclude /team so it doesn't get two Cache-Control headers
        source: '/assets/img/:path((?!team/).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },

      // Cache CSS and JS you place under /public/assets/css|js
      {
        source: '/assets/:dir(css|js)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=2592000' },
        ],
      },
    ];
  },
};

export default nextConfig;
