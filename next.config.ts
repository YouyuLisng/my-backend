/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'varc6e4ddyshcb8t.public.blob.vercel-storage.com',
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