import styled from "@emotion/styled"
import { uuidToId } from "notion-utils"
import type { TableOfContentsEntry } from "notion-utils"
import React, { useEffect, useState } from "react"
import { Emoji } from "src/components/Emoji"

type Props = {
  entries: TableOfContentsEntry[]
  mobile?: boolean
}

const HEADER_OFFSET = 80

const TableOfContents: React.FC<Props> = ({ entries, mobile = false }) => {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    setActiveId(entries[0] ? uuidToId(entries[0].id) : "")
  }, [entries])

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(uuidToId(entry.id)))
      .map((anchor) => anchor?.closest(".notion-h") ?? anchor)
      .filter((element): element is Element => !!element)

    if (!headings.length) return

    const observer = new IntersectionObserver(
      (items) => {
        const visible = items.find((item) => item.isIntersecting)
        if (!visible) return
        const id = visible.target.getAttribute("data-id")
        if (id) setActiveId(id)
      },
      { rootMargin: `-${HEADER_OFFSET}px 0px -70% 0px` }
    )

    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [entries])

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault()
    const anchor = document.getElementById(id)
    const target = anchor?.closest(".notion-h") ?? anchor
    target?.scrollIntoView({ behavior: "smooth", block: "start" })
    event.currentTarget.closest("details")?.removeAttribute("open")
    window.history.replaceState(null, "", `#${id}`)
  }

  const list = (
    <TocList>
      {entries.map((entry) => {
        const id = uuidToId(entry.id)
        return (
          <li
            key={entry.id}
            style={{ paddingLeft: `${entry.indentLevel * 0.75}rem` }}
          >
            <a
              href={`#${id}`}
              data-active={id === activeId}
              onClick={(event) => handleClick(event, id)}
            >
              {entry.text}
            </a>
          </li>
        )
      })}
    </TocList>
  )

  if (mobile) {
    return (
      <MobileWrapper>
        <details>
          <summary>
            <Emoji>📑</Emoji> 目錄
          </summary>
          {list}
        </details>
      </MobileWrapper>
    )
  }

  return (
    <AsideWrapper aria-label="文章目錄">
      <div className="title">
        <Emoji>📑</Emoji> 目錄
      </div>
      {list}
    </AsideWrapper>
  )
}

export default TableOfContents

const TocList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;

  a {
    display: block;
    padding: 0.35rem 0.5rem 0.35rem 0.75rem;
    border-left: 2px solid transparent;
    border-radius: 0 0.5rem 0.5rem 0;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.gray10};
    overflow-wrap: anywhere;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.gray12};
    background-color: ${({ theme }) => theme.colors.gray4};
  }

  a[data-active="true"] {
    color: ${({ theme }) => theme.colors.gray12};
    border-left-color: ${({ theme }) => theme.colors.gray12};
    background-color: ${({ theme }) => theme.colors.gray4};
    font-weight: 500;
  }
`

const AsideWrapper = styled.nav`
  position: sticky;
  top: 4.5rem;
  align-self: start;
  overflow-y: auto;
  max-height: calc(100vh - 6rem);
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  > .title {
    padding: 0.25rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray11};
  }
`

const MobileWrapper = styled.div`
  margin-top: 1.5rem;
  padding: 0 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.gray6};
  border-radius: 1rem;

  summary {
    padding: 0.75rem 0;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.gray11};
    cursor: pointer;
  }

  ${TocList} {
    padding-bottom: 0.75rem;
  }
`
