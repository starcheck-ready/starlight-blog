import { GetStaticProps } from "next"
import { CONFIG } from "site.config"
import { getPosts } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { filterPosts } from "src/libs/utils/notion"
import Series, { SeriesPost, SeriesSummary } from "src/routes/Series"
import { NextPageWithLayout } from "src/types"

type Props = {
  series: SeriesSummary[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = filterPosts(await getPosts(), {
    acceptStatus: ["Public", "Outdated"],
  })

  const groups = new Map<string, SeriesPost[]>()

  posts.forEach((post) => {
    const name = post.Series?.[0]
    if (!name) return

    const order = Number(post.SeriesOrder)
    const item: SeriesPost = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      date: post.date?.start_date || post.createdTime,
      outdated: post.status?.[0] === "Outdated",
      ...(Number.isFinite(order) ? { order } : {}),
    }

    const list = groups.get(name)
    if (list) list.push(item)
    else groups.set(name, [item])
  })

  const series: SeriesSummary[] = Array.from(groups, ([name, items]) => ({
    name,
    posts: items.sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER) ||
        new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
  }))

  series.sort((a, b) => {
    const latest = (group: SeriesSummary) =>
      Math.max(...group.posts.map((post) => new Date(post.date).getTime()))
    return latest(b) - latest(a)
  })

  return {
    props: { series },
    revalidate: CONFIG.revalidateTime,
  }
}

const SeriesPage: NextPageWithLayout<Props> = ({ series }) => {
  const meta = {
    title: `系列總覽 | ${CONFIG.blog.title}`,
    description: "依系列與篇章順序整理的文章列表。",
    type: "website",
    url: `${CONFIG.link}/series`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Series series={series} />
    </>
  )
}

SeriesPage.getLayout = (page) => {
  return <>{page}</>
}

export default SeriesPage
