import nextPwa from "@ducanh2912/next-pwa";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

const withPWA = nextPwa({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNavigations: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*$/i,
      handler: "CacheFirst",
      options: { cacheName: "google-fonts", expiration: { maxEntries: 4, maxAgeSeconds: 31_536_000 } },
    },
  ],
});

export default withPWA(nextConfig);
