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
  },
  webpack: (config, { isServer }) => {
    // Disable webpack cache warnings for CSS modules
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  }
}

module.exports = nextConfig