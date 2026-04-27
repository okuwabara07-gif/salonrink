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
  async redirects() {
    return [
      // Group 1: 顧客タブ（旧 /dashboard/karte）
      {
        source: '/dashboard/karte',
        destination: '/dashboard/customers',
        permanent: true,
      },
      {
        source: '/dashboard/karte/:path*',
        destination: '/dashboard/customers/:path*',
        permanent: true,
      },
      // Group 2: 連携タブ（追加予定）
      {
        source: '/dashboard/line',
        destination: '/dashboard/integrations/line',
        permanent: true,
      },
      {
        source: '/dashboard/hotpepper',
        destination: '/dashboard/integrations/hotpepper',
        permanent: true,
      },
      {
        source: '/dashboard/richmenu',
        destination: '/dashboard/integrations/richmenu',
        permanent: true,
      },
      {
        source: '/dashboard/hpb-setup',
        destination: '/dashboard/integrations/hpb-setup',
        permanent: true,
      },
      {
        source: '/dashboard/sync-status',
        destination: '/dashboard/integrations/sync-status',
        permanent: true,
      },
      // Group 3: その他タブ（追加予定）
      {
        source: '/dashboard/plan',
        destination: '/dashboard/more/plan',
        permanent: true,
      },
      {
        source: '/dashboard/settings',
        destination: '/dashboard/more/settings',
        permanent: true,
      },
    ];
  },
};

export default pwaConfig(nextConfig);
