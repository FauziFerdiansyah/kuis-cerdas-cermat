/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Jika deploy ke subdirectory (misal: username.github.io/repo-name)
  // basePath: '/nama-repo',
  // assetPrefix: '/nama-repo',
}

module.exports = nextConfig