import styled from "@emotion/styled"
import Link from "next/link"
import React from "react"
import { Emoji } from "src/components/Emoji"
import type { TPost, TPosts } from "src/types"

type Props = {
  current: TPost
  posts: TPosts
}

const getPostTime = (post: TPost) =>
  new Date(post.date?.start_date || post.createdTime).getTime()

const SeriesNav: React.FC<Props> = ({ current, posts }) => {
  const seriesName = current.Series?.[0]
  if (!seriesName) return null

  const seriesPosts = posts
    .filter((post) => post.Series?.[0] === seriesName)
    .sort(
      (a, b) =>
        Number(a.SeriesOrder ?? 0) - Number(b.SeriesOrder ?? 0) ||
        getPostTime(a) - getPostTime(b)
    )

  if (seriesPosts.length === 0) return null

  const currentIndex = seriesPosts.findIndex((post) => post.id === current.id)

  return (
    <StyledWrapper>
      <div className="header">
        <span className="title">
          <Emoji>📖</Emoji> 系列：{seriesName}
        </span>
        <span className="count">
          {currentIndex >= 0
            ? `${currentIndex + 1} / ${seriesPosts.length}`
            : `${seriesPosts.length} 篇`}
        </span>
      </div>
      <ol>
        {seriesPosts.map((post, index) => (
          <li key={post.id} data-active={post.id === current.id}>
            <Link
              href={`/${post.slug}`}
              aria-current={post.id === current.id ? "page" : undefined}
            >
              <span className="order">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="name">{post.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </StyledWrapper>
  )
}

export default SeriesNav

const StyledWrapper = styled.div`
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray6};

  > .header {
    display: flex;
    margin-bottom: 0.75rem;
    gap: 1rem;
    justify-content: space-between;
    align-items: baseline;

    > .title {
      overflow: hidden;
      min-width: 0;
      font-size: 1.0625rem;
      line-height: 1.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.gray12};
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    > .count {
      flex-shrink: 0;
      font-size: 0.75rem;
      line-height: 1rem;
      color: ${({ theme }) => theme.colors.gray10};
      font-variant-numeric: tabular-nums;
    }
  }

  > ol {
    padding: 0;
    margin: 0;
    list-style: none;

    > li > a {
      display: flex;
      padding: 0.5rem 0.625rem;
      gap: 0.75rem;
      align-items: baseline;
      border-radius: 0.75rem;

      :hover {
        background-color: ${({ theme }) => theme.colors.gray5};
      }
    }

    > li[data-active="true"] > a {
      background-color: ${({ theme }) => theme.colors.gray5};

      > .name {
        font-weight: 600;
        color: ${({ theme }) => theme.colors.gray12};
      }
    }

    .order {
      flex-shrink: 0;
      font-size: 0.75rem;
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray9};
      font-variant-numeric: tabular-nums;
    }

    .name {
      overflow: hidden;
      font-size: 0.9375rem;
      line-height: 1.5;
      color: ${({ theme }) => theme.colors.gray11};
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`
