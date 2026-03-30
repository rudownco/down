import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@down/common'],
  webpack: (config) => {
    // Resolve .web.tsx/.web.ts before .tsx/.ts for platform-specific shared components
    config.resolve.extensions = [
      '.web.tsx', '.web.ts', '.web.js',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

export default nextConfig;
