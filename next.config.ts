import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/lp-mock/index.html' },
        { source: '/lp', destination: '/lp/index.html' },
        { source: '/lp/customer', destination: '/lp-mock/customer.html' },
        { source: '/lp/salon', destination: '/lp-mock/salon.html' },
        { source: '/lp/partner', destination: '/lp-mock/partner.html' },
      ],
    };
  },
  async redirects() {
    return [
      { source: '/dashboard/karte', destination: '/dashboard/customers', permanent: true },
      { source: '/dashboard/karte/:path*', destination: '/dashboard/customers/:path*', permanent: true },
      { source: '/dashboard/line', destination: '/dashboard/integrations/line', permanent: true },
      { source: '/dashboard/hotpepper', destination: '/dashboard/integrations/hotpepper', permanent: true },
      { source: '/dashboard/richmenu', destination: '/dashboard/integrations/richmenu', permanent: true },
      { source: '/dashboard/hpb-setup', destination: '/dashboard/integrations/hpb-setup', permanent: true },
      { source: '/dashboard/sync-status', destination: '/dashboard/integrations/sync-status', permanent: true },
      { source: '/dashboard/plan', destination: '/dashboard/more/plan', permanent: true },
      { source: '/dashboard/settings', destination: '/dashboard/more/settings', permanent: true },
    ];
  },
};

export default pwaConfig(nextConfig);
