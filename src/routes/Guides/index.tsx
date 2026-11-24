import styled from "@emotion/styled"
import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useRef, useState } from "react"
import { CONFIG } from "site.config"
import { Emoji } from "src/components/Emoji"
import {
  GUIDE_PROGRESS_EVENT,
  exportGuideProgress,
  importGuideProgress,
  readGuideChecked,
} from "src/libs/guideProgress"
import { formatDate } from "src/libs/utils"

export type GuideSummary = {
  id: string
  slug: string
  title: string
  thumbnail?: string
  category?: string[]
  date: string
  outdated: boolean
  todos: { id: string; checked: boolean }[]
}

type Props = {
  guides: GuideSummary[]
}

const Guides: React.FC<Props> = ({ guides }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const update = () => {
      const next: Record<string, boolean> = {}
      guides.forEach((guide) =>
        guide.todos.forEach((todo) => {
          next[todo.id] = readGuideChecked(todo.id, todo.checked)
        })
      )
      setChecked(next)
    }

    update()
    window.addEventListener(GUIDE_PROGRESS_EVENT, update)
    window.addEventListener("storage", update)

    return () => {
      window.removeEventListener(GUIDE_PROGRESS_EVENT, update)
      window.removeEventListener("storage", update)
    }
  }, [guides])

  const counts = guides.map((guide) => {
    const done = guide.todos.filter((todo) => checked[todo.id]).length
    return { total: guide.todos.length, done }
  })
  const total = counts.reduce((sum, item) => sum + item.total, 0)
  const done = counts.reduce((sum, item) => sum + item.done, 0)

  const handleExport = () => {
    const data = exportGuideProgress()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `starlight-guide-progress-${new Date()
      .toISOString()
      .slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage("已匯出進度檔")
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const count = importGuideProgress(JSON.parse(text))
      setMessage(`已匯入 ${count} 項勾選紀錄`)
    } catch {
      setMessage("匯入失敗：檔案格式不正確")
    } finally {
      event.target.value = ""
    }
  }

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>🎮</Emoji> 攻略總覽
        </h1>
        <p>
          共 {guides.length} 篇攻略，已完成 {done} / {total} 項。
          進度只存在這台裝置的瀏覽器，可用下方按鈕備份。
        </p>
        <div className="toolbar">
          <span className="count">
            總完成度 {total === 0 ? 0 : Math.round((done / total) * 100)}%
          </span>
          <div className="actions">
            <button type="button" onClick={handleExport}>
              匯出進度
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}>
              匯入進度
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={handleImport}
            />
          </div>
        </div>
        {message && <p className="message">{message}</p>}
      </div>

      {guides.length === 0 && (
        <p className="empty">
          還沒有攻略。把文章標上「遊戲攻略」標籤或歸到「遊戲」分類即可出現在這裡。
        </p>
      )}

      <div className="list">
        {guides.map((guide, index) => {
          const { total: guideTotal, done: guideDone } = counts[index]
          const percent = guideTotal === 0 ? 0 : (guideDone / guideTotal) * 100

          return (
            <StyledCard key={guide.id} href={`/${guide.slug}`}>
              <div className="thumb">
                {guide.thumbnail ? (
                  <Image
                    src={guide.thumbnail}
                    fill
                    alt={guide.title}
                    sizes="144px"
                    css={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="placeholder">
                    <Emoji>🎮</Emoji>
                  </span>
                )}
              </div>
              <div className="body">
                <div className="head">
                  <h2>{guide.title}</h2>
                  {guide.outdated && <span className="badge">已過時</span>}
                </div>
                <div className="meta">
                  {guide.category?.[0] && <span>{guide.category[0]}</span>}
                  <span>{formatDate(guide.date, CONFIG.lang)}</span>
                </div>
                {guideTotal > 0 ? (
                  <div className="progress">
                    <div
                      className="bar"
                      role="progressbar"
                      aria-label={`${guide.title} 進度`}
                      aria-valuemin={0}
                      aria-valuemax={guideTotal}
                      aria-valuenow={guideDone}
                    >
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    <span className="number">
                      {guideDone} / {guideTotal}
                    </span>
                  </div>
                ) : (
                  <div className="progress empty-progress">沒有 checklist</div>
                )}
              </div>
            </StyledCard>
          )
        })}
      </div>

      <div className="footer">
        <Link href="/">← 返回首頁</Link>
      </div>
    </StyledWrapper>
  )
}

export default Guides

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

    > .toolbar {
      display: flex;
      flex-wrap: wrap;
      margin-top: 0.75rem;
      gap: 0.75rem;
      justify-content: space-between;
      align-items: center;

      > .count {
        font-size: 0.875rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.gray12};
      }

      > .actions {
        display: flex;
        gap: 0.5rem;

        button {
          padding: 0.35rem 0.75rem;
          border: 1px solid ${({ theme }) => theme.colors.gray6};
          border-radius: 9999px;
          background-color: transparent;
          color: ${({ theme }) => theme.colors.gray11};
          font-size: 0.75rem;
          cursor: pointer;

          :hover {
            background-color: ${({ theme }) => theme.colors.gray5};
            color: ${({ theme }) => theme.colors.gray12};
          }
        }
      }
    }

    > .message {
      color: ${({ theme }) => theme.colors.gray11};
    }
  }

  > .empty {
    margin-top: 2rem;
    color: ${({ theme }) => theme.colors.gray10};
  }

  > .list {
    display: flex;
    margin-top: 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  > .footer {
    margin-top: 1.5rem;
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

const StyledCard = styled(Link)`
  display: flex;
  overflow: hidden;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.gray6};
  border-radius: 1rem;
  text-decoration: none;
  transition: background-color 200ms;

  :hover {
    background-color: ${({ theme }) => theme.colors.gray5};
  }

  > .thumb {
    overflow: hidden;
    position: relative;
    width: 4.5rem;
    height: 4.5rem;
    flex-shrink: 0;
    border-radius: 0.75rem;
    background-color: ${({ theme }) => theme.colors.gray5};

    > .placeholder {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
  }

  > .body {
    flex: 1;
    min-width: 0;

    > .head {
      display: flex;
      gap: 0.5rem;
      align-items: center;

      h2 {
        overflow: hidden;
        font-size: 1rem;
        line-height: 1.5rem;
        font-weight: 600;
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
    }

    > .meta {
      display: flex;
      margin-top: 0.25rem;
      gap: 0.5rem;
      font-size: 0.75rem;
      line-height: 1rem;
      color: ${({ theme }) => theme.colors.gray10};
    }

    > .progress {
      display: flex;
      margin-top: 0.5rem;
      gap: 0.5rem;
      align-items: center;

      > .bar {
        overflow: hidden;
        height: 5px;
        flex: 1;
        border-radius: 9999px;
        background-color: ${({ theme }) => theme.colors.gray6};

        > span {
          display: block;
          height: 100%;
          border-radius: 9999px;
          background-color: ${({ theme }) => theme.colors.gray12};
          transition: width 200ms;
        }
      }

      > .number {
        flex-shrink: 0;
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.gray10};
        font-variant-numeric: tabular-nums;
      }

      &.empty-progress {
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.gray9};
      }
    }
  }
`
