import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.sanity.io"],
    // or, if you prefer remotePatterns:
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "cdn.sanity.io",
    //     pathname: "/images/**",
    //   },
    // ],
  },
};

export default nextConfig;
