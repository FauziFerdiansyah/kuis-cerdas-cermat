/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Aktifkan untuk GitHub Pages subdirectory
  basePath: '/kuis-cerdas-cermat',
  assetPrefix: '/kuis-cerdas-cermat/',
}

module.exports = nextConfig