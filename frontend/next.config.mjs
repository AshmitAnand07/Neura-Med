/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We allow rendering anywhere, disabling image optimization domains if needed
  images: {
    remotePatterns: [],
  },
}

export default nextConfig;
