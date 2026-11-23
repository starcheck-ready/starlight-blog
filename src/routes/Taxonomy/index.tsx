import styled from "@emotion/styled"
import Link from "next/link"
import React, { useMemo } from "react"
import { Emoji } from "src/components/Emoji"
import usePostsQuery from "src/hooks/usePostsQuery"
import PostCard from "src/routes/Feed/PostList/PostCard"
import type { TPost, TPosts } from "src/types"

type Props = {
  kind: "tag" | "category"
  value: string
}

const getPostTime = (post: TPost) =>
  new Date(post.date?.start_date || post.createdTime).getTime()

const Taxonomy: React.FC<Props> = ({ kind, value }) => {
  const posts = usePostsQuery()

  const filteredPosts = useMemo(() => {
    const sorted = [...posts].sort((a, b) => getPostTime(b) - getPostTime(a))

    return sorted.filter((post) =>
      kind === "tag"
        ? post.tags?.includes(value)
        : post.category?.includes(value)
    ) as TPosts
  }, [kind, posts, value])

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>{kind === "tag" ? "🏷️" : "📂"}</Emoji>{" "}
          {kind === "tag" ? "Tag" : "Category"}：{value}
        </h1>
        <div className="meta">
          <span>{filteredPosts.length} 篇文章</span>
          <Link href="/">← 返回首頁</Link>
        </div>
      </div>
      {filteredPosts.length === 0 && (
        <p className="empty">
          此{kind === "tag" ? "標籤" : "分類"}下還沒有文章。
        </p>
      )}
      {filteredPosts.map((post) => (
        <PostCard key={post.id} data={post} />
      ))}
    </StyledWrapper>
  )
}

export default Taxonomy

const StyledWrapper = styled.div`
  padding: 2rem 0;
  margin: 0 auto;
  max-width: 42rem;

  > .hero {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};

    h1 {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    > .meta {
      display: flex;
      margin-top: 0.5rem;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray10};

      a:hover {
        color: ${({ theme }) => theme.colors.gray12};
      }
    }
  }

  > .empty {
    color: ${({ theme }) => theme.colors.gray10};
  }
`
