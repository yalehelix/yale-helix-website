/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    // Increase the maximum body size for API routes
    maxBodySize: '50mb',
  },
};

export default nextConfig;
