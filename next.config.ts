import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/lobby",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
