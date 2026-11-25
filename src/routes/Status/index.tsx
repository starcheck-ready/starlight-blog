import styled from "@emotion/styled"
import Link from "next/link"
import React from "react"
import { CONFIG } from "site.config"
import { Emoji } from "src/components/Emoji"
import { isGuidePost } from "src/libs/guide"
import { formatDate } from "src/libs/utils"
import { TPost, TPosts } from "src/types"

const STALE_DAYS = 180
const VERIFY_DAYS = 180

const getTime = (post: TPost) =>
  new Date(post.date?.start_date || post.createdTime).getTime()

const getDaysSince = (post: TPost) => (Date.now() - getTime(post)) / 86_400_000

type Check = {
  key: string
  label: string
  hint: string
  test: (post: TPost) => boolean
}

const checks: Check[] = [
  {
    key: "outdated",
    label: "已標記過時",
    hint: "確認要修正資料、改回 Public，或繼續保留作為紀錄",
    test: (post) => post.status?.[0] === "Outdated",
  },
  {
    key: "summary",
    label: "缺少摘要",
    hint: "文章列表與分享卡片會缺少描述",
    test: (post) => !post.summary?.trim(),
  },
  {
    key: "thumbnail",
    label: "缺少縮圖",
    hint: "分享預覽與文章卡片會比較單薄",
    test: (post) => !post.thumbnail,
  },
  {
    key: "category",
    label: "缺少分類",
    hint: "不會出現在分類頁，也少了分類篩選",
    test: (post) => !post.category?.length,
  },
  {
    key: "tags",
    label: "缺少標籤",
    hint: "較難被相關文章與標籤頁推薦",
    test: (post) => !post.tags?.length,
  },
  {
    key: "stale",
    label: `超過 ${STALE_DAYS} 天未更新`,
    hint: "建議複查資料是否仍然正確",
    test: (post) => getDaysSince(post) > STALE_DAYS,
  },
  {
    key: "verified-missing",
    label: "攻略未標記驗證日期",
    hint: "在 Notion 的 Verified 日期欄位填上最後確認日期",
    test: (post) => isGuidePost(post) && !post.Verified?.start_date,
  },
  {
    key: "verified-stale",
    label: `攻略超過 ${VERIFY_DAYS} 天未驗證`,
    hint: "遊戲改版後建議重新確認內容，並更新 Verified 日期",
    test: (post) => {
      const verified = post.Verified?.start_date
      if (!isGuidePost(post) || !verified) return false
      return (
        (Date.now() - new Date(verified).getTime()) / 86_400_000 > VERIFY_DAYS
      )
    },
  },
]

type Props = {
  posts: TPosts
}

const Status: React.FC<Props> = ({ posts }) => {
  const rows = posts.map((post) => ({
    post,
    issues: checks.filter((check) => check.test(post)),
  }))
  const unhealthy = rows.filter((row) => row.issues.length > 0)

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>🩺</Emoji> 內容健檢
        </h1>
        <p>
          共 {posts.length} 篇公開文章，{unhealthy.length} 篇有需要注意的地方。
          此頁設為 noindex，不會出現在搜尋結果與 sitemap。
        </p>
      </div>

      <div className="checks">
        {checks.map((check) => {
          const count = rows.filter((row) =>
            row.issues.some((issue) => issue.key === check.key)
          ).length
          return (
            <div key={check.key} className="check" data-bad={count > 0}>
              <span className="count">{count}</span>
              <span className="label">{check.label}</span>
            </div>
          )
        })}
      </div>

      {unhealthy.length === 0 && <p className="ok">🎉 全部文章都通過檢查。</p>}

      {checks.map((check) => {
        const items = rows.filter((row) =>
          row.issues.some((issue) => issue.key === check.key)
        )
        if (items.length === 0) return null

        return (
          <section key={check.key}>
            <div className="section-title">
              <h2>{check.label}</h2>
              <span>{items.length} 篇</span>
            </div>
            <p className="hint">{check.hint}</p>
            <ul>
              {items.map(({ post }) => (
                <li key={post.id}>
                  <Link href={`/${post.slug}`}>{post.title}</Link>
                  <span className="date">
                    {formatDate(
                      post.date?.start_date || post.createdTime,
                      CONFIG.lang
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <div className="footer">
        <Link href="/">← 返回首頁</Link>
      </div>
    </StyledWrapper>
  )
}

export default Status

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

  > .checks {
    display: flex;
    margin-top: 1.25rem;
    flex-wrap: wrap;
    gap: 0.5rem;

    > .check {
      display: flex;
      padding: 0.5rem 0.75rem;
      gap: 0.5rem;
      align-items: center;
      border: 1px solid ${({ theme }) => theme.colors.gray6};
      border-radius: 9999px;
      font-size: 0.8125rem;
      color: ${({ theme }) => theme.colors.gray10};

      &[data-bad="true"] {
        border-color: ${({ theme }) => theme.colors.gray8};
        color: ${({ theme }) => theme.colors.gray12};
      }

      > .count {
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
    }
  }

  > .ok {
    margin-top: 2rem;
    color: ${({ theme }) => theme.colors.gray11};
  }

  > section {
    margin-top: 2rem;

    > .section-title {
      display: flex;
      gap: 0.5rem;
      align-items: baseline;

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

    > .hint {
      margin-top: 0.125rem;
      font-size: 0.75rem;
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray9};
    }

    ul {
      padding: 0;
      margin: 0.5rem 0 0;
      list-style: none;
    }

    li {
      display: flex;
      padding: 0.55rem 0.5rem;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      border-radius: 0.75rem;

      :hover {
        background-color: ${({ theme }) => theme.colors.gray5};
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
  }
`
