import styled from "@emotion/styled"
import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"
import { Emoji } from "src/components/Emoji"
import usePostsQuery from "src/hooks/usePostsQuery"
import { BOOKMARK_EVENT, readBookmarks } from "src/libs/bookmarks"
import PostCard from "src/routes/Feed/PostList/PostCard"
import { TPost } from "src/types"

const Saved: React.FC = () => {
  const posts = usePostsQuery()
  const [slugs, setSlugs] = useState<string[]>([])

  useEffect(() => {
    const update = () => setSlugs(readBookmarks())

    update()
    window.addEventListener(BOOKMARK_EVENT, update)
    window.addEventListener("storage", update)

    return () => {
      window.removeEventListener(BOOKMARK_EVENT, update)
      window.removeEventListener("storage", update)
    }
  }, [])

  const savedPosts = useMemo(
    () =>
      slugs
        .map((slug) => posts.find((post) => post.slug === slug))
        .filter((post): post is TPost => !!post),
    [slugs, posts]
  )

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>🔖</Emoji> 收藏
        </h1>
        <p>
          共 {savedPosts.length} 篇收藏。收藏只存在這台裝置的瀏覽器；
          已過時或已下架的文章不會出現在這裡。
        </p>
      </div>

      {savedPosts.length === 0 && (
        <div className="empty">
          <p>還沒有收藏的文章。</p>
          <p>在文章頁右上角按下書籤圖示，就會出現在這裡。</p>
          <Link href="/">← 回首頁逛逛</Link>
        </div>
      )}

      <div className="list">
        {savedPosts.map((post) => (
          <PostCard key={post.id} data={post} />
        ))}
      </div>
    </StyledWrapper>
  )
}

export default Saved

const StyledWrapper = styled.div`
  padding: 2.5rem;
  margin: 2rem auto;
  border-radius: 1.5rem;
  max-width: 56rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  > .hero {
    padding-bottom: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};

    h1 {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 700;
    }

    p {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: ${({ theme }) => theme.colors.gray10};
    }
  }

  > .empty {
    padding: 3rem 0;
    text-align: center;
    color: ${({ theme }) => theme.colors.gray10};

    p {
      font-size: 0.875rem;
      line-height: 1.5;
    }

    a {
      display: inline-block;
      margin-top: 1rem;
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray12};
    }
  }

  > .list {
    margin-top: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;
  }
`
