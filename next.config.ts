/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ This will disable type checking during builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ This will disable ESLint during builds
    ignoreDuringBuilds: true,
  },
}

export default nextConfig