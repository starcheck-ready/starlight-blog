import styled from "@emotion/styled"
import { useRouter } from "next/router"
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AiOutlineSearch } from "react-icons/ai"
import { CONFIG } from "site.config"
import usePostsQuery from "src/hooks/usePostsQuery"
import { formatDate } from "src/libs/utils"
import type { TPost } from "src/types"

const MAX_RESULTS = 8

const getPostTime = (post: TPost) =>
  new Date(post.date?.start_date || post.createdTime).getTime()

const GlobalSearch: React.FC = () => {
  const posts = usePostsQuery()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [q, setQ] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => !prev)
      } else if (event.key === "Escape") {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return

    setQ("")
    setActiveIndex(0)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [q])

  const results = useMemo(() => {
    const keyword = q.trim().toLowerCase()

    if (!keyword) {
      return [...posts]
        .sort((a, b) => getPostTime(b) - getPostTime(a))
        .slice(0, MAX_RESULTS)
    }

    return posts
      .map((post) => {
        const title = post.title.toLowerCase()
        const tags = (post.tags ?? []).join(" ").toLowerCase()
        const category = (post.category ?? []).join(" ").toLowerCase()
        const summary = (post.summary ?? "").toLowerCase()

        let score = 0
        if (title.includes(keyword)) score += 4
        if (tags.includes(keyword)) score += 3
        if (category.includes(keyword)) score += 2
        if (summary.includes(keyword)) score += 1

        return { post, score }
      })
      .filter(({ score }) => score > 0)
      .sort(
        (a, b) => b.score - a.score || getPostTime(b.post) - getPostTime(a.post)
      )
      .slice(0, MAX_RESULTS)
      .map(({ post }) => post)
  }, [posts, q])

  const handleSelect = (post: TPost) => {
    setOpen(false)
    router.push(`/${post.slug}`)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(results.length - 1, 0))
      )
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === "Enter") {
      const post = results[activeIndex]
      if (post) handleSelect(post)
    }
  }

  const highlight = (text: string): ReactNode => {
    const keyword = q.trim()
    if (!keyword) return text

    const index = text.toLowerCase().indexOf(keyword.toLowerCase())
    if (index === -1) return text

    return (
      <>
        {text.slice(0, index)}
        <mark>{text.slice(index, index + keyword.length)}</mark>
        {text.slice(index + keyword.length)}
      </>
    )
  }

  return (
    <>
      <Trigger
        type="button"
        onClick={() => setOpen(true)}
        aria-label="搜尋文章"
      >
        <AiOutlineSearch className="icon" />
        <span className="hint">⌘K</span>
      </Trigger>
      {mounted &&
        open &&
        createPortal(
          <Overlay onClick={() => setOpen(false)}>
            <Dialog
              role="dialog"
              aria-modal="true"
              aria-label="搜尋文章"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="search">
                <AiOutlineSearch className="icon" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="搜尋文章、標籤…"
                  aria-label="搜尋文章"
                />
                <button
                  type="button"
                  className="esc"
                  onClick={() => setOpen(false)}
                >
                  Esc
                </button>
              </div>
              <div className="results">
                {results.map((post, index) => (
                  <button
                    key={post.id}
                    type="button"
                    data-active={index === activeIndex}
                    onClick={() => handleSelect(post)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="title">{highlight(post.title)}</span>
                    <span className="meta">
                      {formatDate(
                        post.date?.start_date || post.createdTime,
                        CONFIG.lang
                      )}
                      {post.category?.[0] ? ` · ${post.category[0]}` : ""}
                    </span>
                  </button>
                ))}
                {results.length === 0 && (
                  <div className="empty">找不到相關文章</div>
                )}
              </div>
              <div className="footer">
                <span>↑↓ 選擇</span>
                <span>Enter 開啟</span>
                <span>Esc 關閉</span>
              </div>
            </Dialog>
          </Overlay>,
          document.body
        )}
    </>
  )
}

export default GlobalSearch

const Trigger = styled.button`
  display: flex;
  padding: 0 0.625rem;
  height: 2.125rem;
  gap: 0.35rem;
  align-items: center;
  border: none;
  border-radius: 9999px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.gray11};
  font-size: 1.1rem;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.colors.gray5};
    color: ${({ theme }) => theme.colors.gray12};
  }

  > .hint {
    font-size: 0.6875rem;
    line-height: 1rem;
    color: ${({ theme }) => theme.colors.gray10};
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    padding: 0;
    width: 2rem;
    height: 2rem;
    justify-content: center;

    > .hint {
      display: none;
    }
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndexes.dialog};
  display: flex;
  padding: 12vh 1rem 1rem;
  justify-content: center;
  align-items: flex-start;
  background-color: rgba(0, 0, 0, 0.5);
`

const Dialog = styled.div`
  display: flex;
  overflow: hidden;
  width: min(40rem, 100%);
  max-height: 70vh;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.gray6};
  border-radius: 1rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray3};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

  > .search {
    display: flex;
    padding: 1rem 1.25rem;
    gap: 0.75rem;
    align-items: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};

    > .icon {
      flex-shrink: 0;
      color: ${({ theme }) => theme.colors.gray10};
      font-size: 1.25rem;
    }

    > input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      color: ${({ theme }) => theme.colors.gray12};
      font-size: 1rem;
      line-height: 1.5;

      ::placeholder {
        color: ${({ theme }) => theme.colors.gray9};
      }
    }

    > .esc {
      flex-shrink: 0;
      padding: 0.15rem 0.4rem;
      border: 1px solid ${({ theme }) => theme.colors.gray6};
      border-radius: 0.375rem;
      background: transparent;
      color: ${({ theme }) => theme.colors.gray10};
      font-size: 0.6875rem;
      cursor: pointer;
    }
  }

  > .results {
    overflow-y: auto;
    padding: 0.5rem;

    > button {
      display: flex;
      padding: 0.75rem;
      width: 100%;
      flex-direction: column;
      gap: 0.25rem;
      border: none;
      border-radius: 0.75rem;
      background: transparent;
      text-align: left;
      cursor: pointer;

      &[data-active="true"] {
        background-color: ${({ theme }) => theme.colors.gray5};
      }

      > .title {
        font-size: 0.9375rem;
        line-height: 1.4;
        font-weight: 500;
        color: ${({ theme }) => theme.colors.gray12};
      }

      mark {
        background: transparent;
        color: inherit;
        font-weight: 700;
        text-decoration: underline;
      }

      > .meta {
        font-size: 0.75rem;
        line-height: 1rem;
        color: ${({ theme }) => theme.colors.gray10};
      }
    }

    > .empty {
      padding: 2rem 0.75rem;
      text-align: center;
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray10};
    }
  }

  > .footer {
    display: flex;
    padding: 0.5rem 0.75rem;
    gap: 1rem;
    border-top: 1px solid ${({ theme }) => theme.colors.gray6};
    font-size: 0.6875rem;
    line-height: 1rem;
    color: ${({ theme }) => theme.colors.gray10};
  }
`
