/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  },
  // Remover rewrites - causam problemas no Vercel
  // A API será chamada diretamente via NEXT_PUBLIC_API_URL
};

module.exports = nextConfig;
