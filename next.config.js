/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Notion image URLs now 302 redirect to img.notionusercontent.com, which the
    // Next.js image optimizer does not follow, so serve them directly instead.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.notion.so',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // accept all subdomains of googleusercontent.com
      },
      {
        protocol: 'https',
        hostname: 's3-us-west-2.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig
