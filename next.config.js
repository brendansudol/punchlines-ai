/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverActions: true
  },
  async redirects() {
    return [
      {
        source: '/hello',
        destination: '/',
        permanent: false
      }
    ];
  }
};

module.exports = nextConfig;
