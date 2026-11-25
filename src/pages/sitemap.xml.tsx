import { getPosts } from "../apis/notion-client/getPosts"
import { filterPosts, getAllSelectItemsFromPosts } from "src/libs/utils/notion"
import { CONFIG } from "site.config"
import { getServerSideSitemap, ISitemapField } from "next-sitemap"
import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const posts = await getPosts()
  const feedPosts = filterPosts(posts)
  const dynamicPaths = feedPosts.map((post) => `${CONFIG.link}/${post.slug}`)

  // Create an array of fields, each with a loc and lastmod
  const fields: ISitemapField[] = dynamicPaths.map((path) => ({
    loc: path,
    lastmod: new Date().toISOString(),
    priority: 0.7,
    changefreq: "daily",
  }))

  const tags = Object.keys(
    getAllSelectItemsFromPosts("tags", feedPosts)
  ).filter((tag) => tag !== "Pinned")
  const categories = Object.keys(
    getAllSelectItemsFromPosts("category", feedPosts)
  )

  tags.forEach((tag) =>
    fields.push({
      loc: `${CONFIG.link}/tags/${encodeURIComponent(tag)}`,
      lastmod: new Date().toISOString(),
      priority: 0.6,
      changefreq: "daily",
    })
  )

  categories.forEach((category) =>
    fields.push({
      loc: `${CONFIG.link}/categories/${encodeURIComponent(category)}`,
      lastmod: new Date().toISOString(),
      priority: 0.6,
      changefreq: "daily",
    })
  )

  // Include static pages separately
  fields.unshift(
    {
      loc: `${CONFIG.link}/projects`,
      lastmod: new Date().toISOString(),
      priority: 0.8,
      changefreq: "daily",
    },
    {
      loc: `${CONFIG.link}/guides`,
      lastmod: new Date().toISOString(),
      priority: 0.8,
      changefreq: "daily",
    },
    {
      loc: `${CONFIG.link}/series`,
      lastmod: new Date().toISOString(),
      priority: 0.7,
      changefreq: "daily",
    },
    {
      loc: `${CONFIG.link}/archive`,
      lastmod: new Date().toISOString(),
      priority: 0.8,
      changefreq: "daily",
    },
    {
      loc: CONFIG.link,
      lastmod: new Date().toISOString(),
      priority: 1.0,
      changefreq: "daily",
    }
  )

  return getServerSideSitemap(ctx, fields)
}

// Default export to prevent next.js errors
export default () => {}
