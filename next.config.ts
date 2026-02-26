/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dxasckwdgwmgtar4.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig