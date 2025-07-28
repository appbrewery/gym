/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  basePath: isProd ? '/gym' : '',
  assetPrefix: isProd ? '/gym' : '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig