/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: "/PostresPL",
  trailingSlash: true,
};

module.exports = nextConfig;
