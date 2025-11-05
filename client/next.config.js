/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
  },
  async rewrites() {
    // In production (Vercel), API calls will go to the deployed backend
    // In development, proxy to localhost:3002
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
