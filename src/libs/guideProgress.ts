import { storage } from "src/libs/safeStorage"

export const GUIDE_PROGRESS_EVENT = "guide-progress-change"

const STORAGE_PREFIX = "starlight:guide:"

const getStorageKey = (blockId: string) => `${STORAGE_PREFIX}${blockId}`

export const readGuideChecked = (blockId: string, fallback: boolean) => {
  if (typeof window === "undefined") return fallback

  const value = storage.get(getStorageKey(blockId))
  return value === null ? fallback : value === "true"
}

export const writeGuideChecked = (blockId: string, checked: boolean) => {
  if (typeof window === "undefined") return

  storage.set(getStorageKey(blockId), String(checked))
  window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT))
}

export const resetGuideChecked = (blockIds: string[]) => {
  if (typeof window === "undefined") return

  blockIds.forEach((blockId) => storage.remove(getStorageKey(blockId)))
  window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT))
}

export type GuideProgressExport = {
  version: 1
  exportedAt: string
  progress: Record<string, true>
}

export const exportGuideProgress = (): GuideProgressExport => {
  const progress: Record<string, true> = {}

  storage
    .keys()
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => {
      if (storage.get(key) === "true") {
        progress[key.slice(STORAGE_PREFIX.length)] = true
      }
    })

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
    storage.set(getStorageKey(blockId), "true")
    count++
  })

  window.dispatchEvent(new Event(GUIDE_PROGRESS_EVENT))
  return count
}
