/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@algoviz/dvir", "@algoviz/visualizer-core"],
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
