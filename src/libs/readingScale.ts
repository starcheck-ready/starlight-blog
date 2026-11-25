export type ReadingScale = "small" | "medium" | "large"

export const READING_SCALE_EVENT = "reading-scale-change"

const STORAGE_KEY = "starlight:reading-scale"

export const READING_SCALES: { value: ReadingScale; label: string }[] = [
  { value: "small", label: "小" },
  { value: "medium", label: "中" },
  { value: "large", label: "大" },
]

export const readReadingScale = (): ReadingScale => {
  if (typeof window === "undefined") return "medium"

  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === "small" || value === "large" ? value : "medium"
}

export const writeReadingScale = (scale: ReadingScale) => {
  if (typeof window === "undefined") return

  window.localStorage.setItem(STORAGE_KEY, scale)
  window.dispatchEvent(new Event(READING_SCALE_EVENT))
}
