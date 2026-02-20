/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  // Point tracing root to monorepo root to silence multiple-lockfile warning
  outputFileTracingRoot: path.join(__dirname, '../'),
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'rag.abhee.org', '*.azurewebsites.net'],
    },
  },
};

module.exports = nextConfig;
