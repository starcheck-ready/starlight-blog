const memory = new Map<string, string>()

/**
 * localStorage 在部分預覽 iframe／私密模式會直接拋錯，
 * 這裡統一包一層，失敗時退回記憶體儲存，避免整個頁面崩潰。
 */
export const storage = {
  get(key: string): string | null {
    if (typeof window !== "undefined") {
      try {
        const value = window.localStorage.getItem(key)
        if (value !== null) return value
      } catch {
        // ignore and fall back to memory
      }
    }
    return memory.get(key) ?? null
  },
  set(key: string, value: string) {
    memory.set(key, value)
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // ignore quota/security errors
    }
  },
  remove(key: string) {
    memory.delete(key)
    if (typeof window === "undefined") return
    try {
      window.localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
  keys(): string[] {
    if (typeof window !== "undefined") {
      try {
        const keys: string[] = []
        for (let index = 0; index < window.localStorage.length; index++) {
          const key = window.localStorage.key(index)
          if (key) keys.push(key)
        }
        return keys
      } catch {
        // ignore
      }
    }
    return Array.from(memory.keys())
  },
}
