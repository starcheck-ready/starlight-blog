import { GetServerSideProps } from "next"
import { getPosts } from "src/apis"
import { filterPosts } from "src/libs/utils/notion"
import { CONFIG } from "site.config"

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")

const getPostTime = (date: string) => new Date(date).getTime()

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const posts = filterPosts(await getPosts()).sort(
    (a, b) =>
      getPostTime(b.date?.start_date || b.createdTime) -
      getPostTime(a.date?.start_date || a.createdTime)
  )

  const items = posts
    .map((post) => {
      const url = `${CONFIG.link}/${post.slug}`
      const date = new Date(
        post.date?.start_date || post.createdTime
      ).toUTCString()
      const description = post.summary || post.title
      const categories = (post.tags ?? [])
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join("")

      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${date}</pubDate>
  <description>${escapeXml(description)}</description>
  ${categories}
</item>`
    })
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(CONFIG.blog.title)}</title>
  <link>${CONFIG.link}</link>
  <description>${escapeXml(CONFIG.blog.description)}</description>
  <language>${CONFIG.lang}</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${
    CONFIG.link
  }/rss.xml" rel="self" type="application/rss+xml" />
  ${items}
</channel>
</rss>`

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8")
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400"
  )
  res.write(xml)
  res.end()

  return { props: {} }
}

const Rss = () => null

export default Rss
