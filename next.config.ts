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
      {
        protocol: 'https',
        hostname: 'dcxn8ladrevqu64e.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'travel.dtsgroup.com.tw',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig