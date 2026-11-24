import styled from "@emotion/styled"
import Link from "next/link"
import React, { useMemo } from "react"
import { Emoji } from "src/components/Emoji"
import usePostsQuery from "src/hooks/usePostsQuery"
import type { TPost, TPosts } from "src/types"

const getPostDate = (post: TPost) =>
  new Date(post.date?.start_date || post.createdTime)

const formatMonthDay = (post: TPost) => {
  const date = getPostDate(post)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${month}.${day}`
}

const groupByYear = (posts: TPosts) => {
  const sorted = [...posts].sort(
    (a, b) => getPostDate(b).getTime() - getPostDate(a).getTime()
  )
  const groups: { year: number; posts: TPosts }[] = []

  sorted.forEach((post) => {
    const year = getPostDate(post).getFullYear()
    const group = groups.find((item) => item.year === year)

    if (group) group.posts.push(post)
    else groups.push({ year, posts: [post] })
  })

  return groups
}

const Archive: React.FC = () => {
  const posts = usePostsQuery()
  const groups = useMemo(() => groupByYear(posts), [posts])

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>🗂️</Emoji> Archive
        </h1>
        <p>共 {posts.length} 篇文章，依年份排列。</p>
        <div className="links">
          <Link href="/guides">🎮 攻略總覽</Link>
          <Link href="/status">🩺 內容健檢</Link>
        </div>
      </div>
      {groups.length === 0 && <p className="empty">還沒有文章。</p>}
      {groups.map(({ year, posts: yearPosts }) => (
        <section key={year} className="year-group">
          <div className="year-title">
            <span>{year}</span>
            <span className="count">{yearPosts.length} 篇</span>
          </div>
          <ul>
            {yearPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/${post.slug}`}>
                  <span className="date">{formatMonthDay(post)}</span>
                  <span className="title">{post.title}</span>
                  {post.status?.[0] === "Outdated" && (
                    <span className="badge">已過時</span>
                  )}
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </StyledWrapper>
  )
}

export default Archive

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
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray11};
    }

    > .links {
      display: flex;
      flex-wrap: wrap;
      margin-top: 0.5rem;
      gap: 1rem;
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray10};

      a:hover {
        color: ${({ theme }) => theme.colors.gray12};
      }
    }
  }

  > .empty {
    margin-top: 2rem;
    color: ${({ theme }) => theme.colors.gray10};
  }

  .year-group {
    margin-top: 2rem;

    > .year-title {
      display: flex;
      padding-bottom: 0.5rem;
      gap: 0.5rem;
      align-items: baseline;
      border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 700;

      > .count {
        font-size: 0.75rem;
        line-height: 1rem;
        font-weight: 400;
        color: ${({ theme }) => theme.colors.gray10};
      }
    }

    ul {
      padding: 0;
      margin: 0.5rem 0 0;
      list-style: none;
    }

    li a {
      display: flex;
      padding: 0.65rem 0.5rem;
      gap: 1rem;
      align-items: center;
      border-radius: 0.75rem;

      :hover {
        background-color: ${({ theme }) => theme.colors.gray5};

        > .arrow {
          opacity: 1;
        }
      }

      > .date {
        flex-shrink: 0;
        width: 3.25rem;
        font-size: 0.75rem;
        line-height: 1rem;
        color: ${({ theme }) => theme.colors.gray10};
        font-variant-numeric: tabular-nums;
      }

      > .title {
        flex: 1;
        overflow: hidden;
        min-width: 0;
        font-size: 0.9375rem;
        line-height: 1.5;
        color: ${({ theme }) => theme.colors.gray12};
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      > .arrow {
        flex-shrink: 0;
        color: ${({ theme }) => theme.colors.gray9};
        opacity: 0;
        transition: opacity 200ms;
      }

      > .badge {
        flex-shrink: 0;
        padding: 0.1rem 0.4rem;
        border-radius: 0.375rem;
        background-color: ${({ theme }) => theme.colors.gray5};
        color: ${({ theme }) => theme.colors.gray10};
        font-size: 0.6875rem;
        line-height: 1rem;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;

    .year-group li a {
      gap: 0.75rem;

      > .title {
        white-space: normal;
      }

      > .arrow {
        display: none;
      }
    }
  }
`
