/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable server actions (already default in 14, but good to be explicit for older)
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.azurewebsites.net'],
    },
  },
};

module.exports = nextConfig;
