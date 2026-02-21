/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/space-balance',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
