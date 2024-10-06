/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  },
  env: {
    FLASK_API_URL: process.env.FLASK_API_URL,
  },
}

module.exports = nextConfig
