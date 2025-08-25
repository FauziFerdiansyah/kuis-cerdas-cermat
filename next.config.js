/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Untuk GitHub Pages subdirectory
  basePath: '/kuis-cerdas-cermat',
  assetPrefix: '/kuis-cerdas-cermat/',
  // Disable server-side features untuk static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig