export const GUIDE_PROGRESS_EVENT = "guide-progress-change"

const STORAGE_PREFIX = "starlight:guide:"

const getStorageKey = (blockId: string) => `${STORAGE_PREFIX}${blockId}`

export const readGuideChecked = (blockId: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback

  const value = window.localStorage.getItem(getStorageKey(blockId))
  return value === null ? fallback : value === "true"
}

export const writeGuideChecked = (blockId: string, checked: boolean) => {
  if (typeof window === "undefined") return

  window.localStorage.setItem(getStorageKey(blockId), String(checked))
  window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT))
}

export const resetGuideChecked = (blockIds: string[]) => {
  if (typeof window === "undefined") return

  blockIds.forEach((blockId) =>
    window.localStorage.removeItem(getStorageKey(blockId))
  )
  window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT))
}

export type GuideProgressExport = {
  version: 1
  exportedAt: string
  progress: Record<string, true>
}

export const exportGuideProgress = (): GuideProgressExport => {
  const progress: Record<string, true> = {}

  if (typeof window !== "undefined") {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index)
      if (!key || !key.startsWith(STORAGE_PREFIX)) continue
      if (window.localStorage.getItem(key) === "true") {
        progress[key.slice(STORAGE_PREFIX.length)] = true
      }
    }
  }

  return { version: 1, exportedAt: new Date().toISOString(), progress }
}

export const importGuideProgress = (payload: unknown): number => {
  if (typeof window === "undefined") return 0

  const data = payload as Partial<GuideProgressExport>
  if (!data || typeof data !== "object" || typeof data.progress !== "object") {
    throw new Error("Invalid progress file")
  }

  let count = 0
  Object.entries(data.progress ?? {}).forEach(([blockId, checked]) => {
    if (checked !== true) return
    window.localStorage.setItem(getStorageKey(blockId), "true")
    count++
  })

  window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT))
  return count
}
