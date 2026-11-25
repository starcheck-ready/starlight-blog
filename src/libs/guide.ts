import type { TPost } from "src/types"

/**
 * 以標籤或分類判斷是否為攻略文章。
 */
export const isGuidePost = (post: TPost) =>
  (post.tags ?? []).includes("遊戲攻略") ||
  (post.category ?? []).includes("遊戲")
