import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ['@heroui/react', 'lucide-react'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: '*',
      pathname: '/**',
    }]
  },
  allowedDevOrigins: [
    '*'
  ]
};
export default withNextIntl(nextConfig);
