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
