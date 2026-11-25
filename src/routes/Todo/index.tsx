import styled from "@emotion/styled"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { Emoji } from "src/components/Emoji"
import {
  GUIDE_PROGRESS_EVENT,
  readGuideChecked,
  writeGuideChecked,
} from "src/libs/guideProgress"
import type { GuideSummary } from "src/libs/guidesData"

type Props = {
  guides: GuideSummary[]
}

const Todo: React.FC<Props> = ({ guides }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

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

  const groups = guides
    .map((guide) => ({
      guide,
      total: guide.todos.length,
      items: guide.todos.filter((todo) => !checked[todo.id]),
    }))
    .filter((group) => group.items.length > 0)

  const total = guides.reduce((sum, guide) => sum + guide.todos.length, 0)
  const remaining = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>📝</Emoji> 待辦清單
        </h1>
        <p>
          攻略 checklist 中尚未完成的項目，還有 {remaining} / {total} 項。
          勾選後會立即從清單移除，並同步文章內的進度。
        </p>
        <div className="links">
          <Link href="/guides">← 回攻略總覽</Link>
        </div>
      </div>

      {remaining === 0 && <p className="empty">🎉 目前沒有未完成的項目。</p>}

      {groups.map(({ guide, total: guideTotal, items }) => (
        <section key={guide.id}>
          <div className="section-title">
            <Link href={`/${guide.slug}`}>{guide.title}</Link>
            <span>
              {guideTotal - items.length} / {guideTotal}
            </span>
          </div>
          <ul>
            {items.map((todo) => (
              <li key={todo.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={false}
                  aria-label={`完成：${todo.text}`}
                  className="check"
                  onClick={() => writeGuideChecked(todo.id, true)}
                >
                  ✓
                </button>
                <span>{todo.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </StyledWrapper>
  )
}

export default Todo

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

    > .links {
      margin-top: 0.5rem;
      font-size: 0.875rem;

      a {
        color: ${({ theme }) => theme.colors.gray10};

        :hover {
          color: ${({ theme }) => theme.colors.gray12};
        }
      }
    }
  }

  > .empty {
    margin-top: 2rem;
    color: ${({ theme }) => theme.colors.gray11};
  }

  > section {
    margin-top: 2rem;

    > .section-title {
      display: flex;
      gap: 0.5rem;
      justify-content: space-between;
      align-items: baseline;

      a {
        font-size: 1.0625rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.gray12};

        :hover {
          text-decoration: underline;
        }
      }

      span {
        flex-shrink: 0;
        font-size: 0.75rem;
        color: ${({ theme }) => theme.colors.gray10};
        font-variant-numeric: tabular-nums;
      }
    }

    ul {
      padding: 0;
      margin: 0.5rem 0 0;
      list-style: none;
    }

    li {
      display: flex;
      padding: 0.4rem 0.25rem;
      gap: 0.625rem;
      align-items: flex-start;
      font-size: 0.9375rem;
      line-height: 1.6;
      color: ${({ theme }) => theme.colors.gray11};

      > .check {
        display: flex;
        width: 1.125rem;
        height: 1.125rem;
        margin-top: 0.2rem;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        border: 1px solid ${({ theme }) => theme.colors.gray7};
        border-radius: 0.25rem;
        background: transparent;
        color: transparent;
        font-size: 0.7rem;
        cursor: pointer;

        :hover {
          border-color: ${({ theme }) => theme.colors.gray9};
          color: ${({ theme }) => theme.colors.gray9};
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;
  }
`
