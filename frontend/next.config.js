/** @type {import('next').NextConfig} */
// Force reload to pick up Prisma Client changes
// Force reload to apply database path fix
// Trigger restart for Prisma Client update
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
