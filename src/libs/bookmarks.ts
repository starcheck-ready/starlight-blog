export const BOOKMARK_EVENT = "bookmark-change"

const STORAGE_KEY = "starlight:bookmarks"

export const readBookmarks = (): string[] => {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : []
  } catch {
    return []
  }
}

const writeBookmarks = (slugs: string[]) => {
  if (typeof window === "undefined") return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  window.dispatchEvent(new Event(BOOKMARK_EVENT))
}

export const isBookmarked = (slug: string) => readBookmarks().includes(slug)

export const toggleBookmark = (slug: string) => {
  const current = readBookmarks()
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [slug, ...current]

  writeBookmarks(next)
  return next.includes(slug)
}
