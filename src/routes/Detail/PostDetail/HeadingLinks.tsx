import { RefObject, useEffect } from "react"

type Props = {
  containerRef: RefObject<HTMLDivElement>
}

/**
 * 強化 Notion 標題旁的錨點：點擊即複製該段深連結並捲到標題。
 */
const HeadingLinks: React.FC<Props> = ({ containerRef }) => {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const handlers = new Map<HTMLAnchorElement, EventListener>()

    const handleClick = (event: Event) => {
      const anchor = event.currentTarget as HTMLAnchorElement
      const href = anchor.getAttribute("href")
      if (!href) return

      event.preventDefault()

      const url = `${window.location.origin}${window.location.pathname}${href}`
      window.history.replaceState(null, "", href)

      const target = document.getElementById(href.replace(/^#/, ""))
      const heading = target?.closest(".notion-h") ?? target
      heading?.scrollIntoView({ behavior: "smooth", block: "start" })

      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).catch(() => {})
      }

      anchor.classList.add("notion-hash-link--copied")
      window.setTimeout(
        () => anchor.classList.remove("notion-hash-link--copied"),
        1200
      )
    }

    const attach = () => {
      root
        .querySelectorAll<HTMLAnchorElement>(".notion-hash-link")
        .forEach((anchor) => {
          if (handlers.has(anchor)) return

          const listener = handleClick as EventListener
          anchor.addEventListener("click", listener)
          anchor.setAttribute("aria-label", "複製此段連結")
          anchor.title = "複製此段連結"
          handlers.set(anchor, listener)
        })
    }

    attach()
    const observer = new MutationObserver(attach)
    observer.observe(root, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      handlers.forEach((listener, anchor) =>
        anchor.removeEventListener("click", listener)
      )
      handlers.clear()
    }
  }, [containerRef])

  return null
}

export default HeadingLinks
