import { getPosts, getRecordMap } from "src/apis"
import { isGuidePost } from "src/libs/guide"
import { filterPosts } from "src/libs/utils/notion"
import { getGuideTodos } from "src/routes/Detail/PostDetail/utils"

export type GuideSummary = {
  id: string
  slug: string
  title: string
  thumbnail?: string
  category?: string[]
  date: string
  outdated: boolean
  verified?: string
  todos: { id: string; text: string; checked: boolean }[]
}

/**
 * 取得所有攻略文章的摘要與 checklist，供 /guides 與 /todo 共用。
 */
export const getGuideSummaries = async (): Promise<GuideSummary[]> => {
  const posts = filterPosts(await getPosts(), {
    acceptStatus: ["Public", "Outdated"],
  })
  const guides: GuideSummary[] = []

  for (const post of posts.filter(isGuidePost)) {
    const recordMap = await getRecordMap(post.id)

    guides.push({
      id: post.id,
      slug: post.slug,
      title: post.title,
      date: post.date?.start_date || post.createdTime,
      outdated: post.status?.[0] === "Outdated",
      todos: getGuideTodos(recordMap, post.id),
      ...(post.thumbnail ? { thumbnail: post.thumbnail } : {}),
      ...(post.category?.length ? { category: post.category } : {}),
      ...(post.Verified?.start_date
        ? { verified: post.Verified.start_date }
        : {}),
    })
  }

  guides.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return guides
}
