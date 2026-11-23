/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/libs/imageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "img.notionusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // accept all subdomains of googleusercontent.com
      },
      {
        protocol: "https",
        hostname: "s3-us-west-2.amazonaws.com",
      },
    ],
  },
}

module.exports = nextConfig
