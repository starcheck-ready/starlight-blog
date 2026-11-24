import { useEffect } from "react"

const STORAGE_PREFIX = "starlight:reading:"

type Props = {
  postId: string
}

/**
 * 記住每篇文章的閱讀位置，下次回來自動捲回上次的地方。
 */
const ReadingPosition: React.FC<Props> = ({ postId }) => {
  useEffect(() => {
    const key = `${STORAGE_PREFIX}${postId}`
    const saved = Number(window.localStorage.getItem(key) || 0)
    let restored = false
    let attempts = 0
    let restoreTimer: number | undefined
    let saveTimer: number | undefined

    if (!saved || window.location.hash) {
      restored = true
    }

    const save = () => {
      if (!restored) return

      const y = window.scrollY
      if (y < 300) window.localStorage.removeItem(key)
      else window.localStorage.setItem(key, String(Math.round(y)))
    }

    const tryRestore = () => {
      if (restored) return

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll < saved && attempts < 15) {
        attempts++
        restoreTimer = window.setTimeout(tryRestore, 200)
        return
      }

      window.scrollTo({ top: Math.min(saved, Math.max(maxScroll, 0)) })
      restored = true
    }

    if (!restored) tryRestore()

    const handleScroll = () => {
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(save, 300)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("pagehide", save)

    return () => {
      window.clearTimeout(restoreTimer)
      window.clearTimeout(saveTimer)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("pagehide", save)
      save()
    }
  }, [postId])

  return null
}

export default ReadingPosition
