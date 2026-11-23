import type { Block, ExtendedRecordMap, PageBlock } from "notion-types"
import {
  getBlockTitle,
  getBlockValue,
  getPageTableOfContents,
  idToUuid,
} from "notion-utils"
import type { TableOfContentsEntry } from "notion-utils"
import type { TPost, TPosts } from "src/types"

const TEXT_BLOCK_TYPES = new Set([
  "text",
  "header",
  "sub_header",
  "sub_sub_header",
  "header_4",
  "bulleted_list",
  "numbered_list",
  "to_do",
  "toggle",
  "quote",
  "callout",
  "code",
])

const CJK_REGEX =
  /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g

const getPageBlock = (
  recordMap: ExtendedRecordMap,
  pageId: string
): Block | undefined => {
  return getBlockValue(
    recordMap.block[pageId] ?? recordMap.block[idToUuid(pageId)]
  )
}

const getPostTime = (post: TPost) =>
  new Date(post.date?.start_date || post.createdTime).getTime()

export const getTableOfContents = (
  recordMap: ExtendedRecordMap,
  pageId: string
): TableOfContentsEntry[] => {
  const page = getPageBlock(recordMap, pageId)
  if (!page) return []

  return getPageTableOfContents(page as PageBlock, recordMap).filter(
    (entry) => entry.text.trim().length > 0
  )
}

const collectText = (
  blockId: string,
  recordMap: ExtendedRecordMap,
  parts: string[]
) => {
  const block = getBlockValue(recordMap.block[blockId])
  if (!block) return

  if (TEXT_BLOCK_TYPES.has(block.type)) {
    parts.push(getBlockTitle(block, recordMap))
  }

  if (
    block.content &&
    block.type !== "collection_view" &&
    block.type !== "collection_view_page"
  ) {
    block.content.forEach((id) => collectText(id, recordMap, parts))
  }
}

/**
 * 以中日韓字元數為主估算閱讀時間，避免英文斷詞邏輯低估中文文章。
 */
export const getReadingTime = (
  recordMap: ExtendedRecordMap,
  pageId: string
): number => {
  const page = getPageBlock(recordMap, pageId)
  if (!page) return 0

  const parts: string[] = []
  ;(page.content ?? []).forEach((id) => collectText(id, recordMap, parts))

  const text = parts.join(" ")
  const cjkCount = (text.match(CJK_REGEX) || []).length
  const wordCount = text
    .replace(CJK_REGEX, " ")
    .split(/\s+/)
    .filter((word) => /[a-zA-Z0-9]/.test(word)).length

  const minutes = cjkCount / 400 + wordCount / 220
  return Math.max(1, Math.round(minutes))
}

export const getAdjacentPosts = (posts: TPosts, current: TPost) => {
  const sorted = [...posts].sort((a, b) => getPostTime(b) - getPostTime(a))
  const index = sorted.findIndex((post) => post.id === current.id)

  if (index === -1) return { newer: undefined, older: undefined }

  return {
    newer: index > 0 ? sorted[index - 1] : undefined,
    older: index < sorted.length - 1 ? sorted[index + 1] : undefined,
  }
}

const getRelatedScore = (post: TPost, current: TPost) => {
  const sharedTags = (post.tags ?? []).filter((tag) =>
    (current.tags ?? []).includes(tag)
  ).length
  const sameCategory = (post.category ?? []).some((category) =>
    (current.category ?? []).includes(category)
  )

  return sharedTags * 2 + (sameCategory ? 2 : 0)
}

/**
 * 優先推薦標籤／分類重疊的文章，不足時以較新文章補齊。
 */
export const getRelatedPosts = (
  posts: TPosts,
  current: TPost,
  limit = 3
): TPosts => {
  return posts
    .filter((post) => post.id !== current.id)
    .map((post) => ({ post, score: getRelatedScore(post, current) }))
    .sort(
      (a, b) => b.score - a.score || getPostTime(b.post) - getPostTime(a.post)
    )
    .slice(0, limit)
    .map(({ post }) => post)
}
