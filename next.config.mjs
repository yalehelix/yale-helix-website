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

      // Portfolio images: very long, immutable (rarely change)
      {
        source: '/assets/img/masonry-portfolio/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },

      // Other images for 1 day with SWR
      {
        // Exclude /team and /masonry-portfolio so they don't get two Cache-Control headers
        source: '/assets/img/:path((?!team/|masonry-portfolio/).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },

      // Prevent CSS and JS caching during development (no-cache)
      {
        source: '/assets/:dir(css|js)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

export default nextConfig;
