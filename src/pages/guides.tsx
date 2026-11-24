import { GetStaticProps } from "next"
import { CONFIG } from "site.config"
import { getPosts, getRecordMap } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { filterPosts } from "src/libs/utils/notion"
import Guides, { GuideSummary } from "src/routes/Guides"
import { getGuideTodos } from "src/routes/Detail/PostDetail/utils"
import { NextPageWithLayout, TPost } from "src/types"

type Props = {
  guides: GuideSummary[]
}

const isGuide = (post: TPost) =>
  (post.tags ?? []).includes("遊戲攻略") ||
  (post.category ?? []).includes("遊戲")

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = filterPosts(await getPosts(), {
    acceptStatus: ["Public", "Outdated"],
  })
  const guides: GuideSummary[] = []

  for (const post of posts.filter(isGuide)) {
    const recordMap = await getRecordMap(post.id)
    const todos = getGuideTodos(recordMap, post.id).map(({ id, checked }) => ({
      id,
      checked,
    }))

    guides.push({
      id: post.id,
      slug: post.slug,
      title: post.title,
      date: post.date?.start_date || post.createdTime,
      outdated: post.status?.[0] === "Outdated",
      todos,
      ...(post.thumbnail ? { thumbnail: post.thumbnail } : {}),
      ...(post.category?.length ? { category: post.category } : {}),
    })
  }

  guides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return {
    props: { guides },
    revalidate: CONFIG.revalidateTime,
  }
}

const GuidesPage: NextPageWithLayout<Props> = ({ guides }) => {
  const meta = {
    title: `攻略總覽 | ${CONFIG.blog.title}`,
    description: "整理站內所有遊戲攻略與個人完成進度。",
    type: "website",
    url: `${CONFIG.link}/guides`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Guides guides={guides} />
    </>
  )
}

GuidesPage.getLayout = (page) => {
  return <>{page}</>
}

export default GuidesPage
