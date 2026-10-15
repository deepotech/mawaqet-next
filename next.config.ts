import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/',
        destination: '/privacy-policy/',
      },
      {
        source: '/%d8%b3%d9%8a%d8%a7%d8%b3%d8%a9-%d8%a7%d9%84%d8%ae%d8%b5%d9%88%d8%b5%d9%8a%d8%a9/',
        destination: '/privacy-policy/',
      },
      {
        source: '/سياسة-الخصوصية/',
        destination: '/privacy-policy/',
      },
    ];
  },
};

export default nextConfig;
