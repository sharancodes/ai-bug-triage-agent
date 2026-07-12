/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type-checking during build - Vercel catches type errors via separate lint step
  typescript: {
    // Don't run tsc during build — use CI check separately
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't fail build on ESLint errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
