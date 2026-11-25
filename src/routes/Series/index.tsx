import styled from "@emotion/styled"
import Link from "next/link"
import React from "react"
import { CONFIG } from "site.config"
import { Emoji } from "src/components/Emoji"
import { formatDate } from "src/libs/utils"

export type SeriesPost = {
  id: string
  slug: string
  title: string
  date: string
  outdated: boolean
  order?: number
}

export type SeriesSummary = {
  name: string
  posts: SeriesPost[]
}

type Props = {
  series: SeriesSummary[]
}

const Series: React.FC<Props> = ({ series }) => {
  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>📚</Emoji> 系列總覽
        </h1>
        <p>共 {series.length} 個系列，依篇章順序排列。</p>
      </div>

      {series.length === 0 && (
        <p className="empty">還沒有設定 Series 的文章。</p>
      )}

      {series.map((group) => (
        <section key={group.name}>
          <div className="section-title">
            <h2>{group.name}</h2>
            <span>{group.posts.length} 篇</span>
          </div>
          <ol>
            {group.posts.map((post) => (
              <li key={post.id}>
                <Link href={`/${post.slug}`}>{post.title}</Link>
                {post.outdated && <span className="badge">已過時</span>}
                <span className="date">
                  {formatDate(post.date, CONFIG.lang)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <div className="footer">
        <Link href="/">← 返回首頁</Link>
      </div>
    </StyledWrapper>
  )
}

export default Series

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
    margin-top: 2rem;
    color: ${({ theme }) => theme.colors.gray10};
  }

  > section {
    margin-top: 2rem;

    > .section-title {
      display: flex;
      padding-bottom: 0.5rem;
      gap: 0.5rem;
      align-items: baseline;
      border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};

      h2 {
        font-size: 1.125rem;
        line-height: 1.75rem;
        font-weight: 700;
      }

      span {
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.gray10};
      }
    }

    ol {
      padding: 0;
      margin: 0.5rem 0 0;
      list-style: none;
      counter-reset: series;
    }

    li {
      display: flex;
      padding: 0.55rem 0.5rem;
      gap: 0.75rem;
      align-items: center;
      border-radius: 0.75rem;
      counter-increment: series;

      :hover {
        background-color: ${({ theme }) => theme.colors.gray5};
      }

      ::before {
        content: counter(series);
        flex-shrink: 0;
        width: 1.25rem;
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.gray9};
        font-variant-numeric: tabular-nums;
        text-align: right;
      }

      a {
        flex: 1;
        overflow: hidden;
        min-width: 0;
        font-size: 0.9375rem;
        color: ${({ theme }) => theme.colors.gray12};
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      > .badge {
        flex-shrink: 0;
        padding: 0.1rem 0.4rem;
        border-radius: 0.375rem;
        background-color: ${({ theme }) => theme.colors.gray6};
        color: ${({ theme }) => theme.colors.gray10};
        font-size: 0.6875rem;
        line-height: 1rem;
      }

      > .date {
        flex-shrink: 0;
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.gray10};
        font-variant-numeric: tabular-nums;
      }
    }
  }

  > .footer {
    margin-top: 2rem;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray10};

    a:hover {
      color: ${({ theme }) => theme.colors.gray12};
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;

    > section li > .date {
      display: none;
    }
  }
`
