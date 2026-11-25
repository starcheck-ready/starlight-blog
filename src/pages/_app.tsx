import { AppPropsWithLayout } from "../types"
import { Hydrate, QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { RootLayout } from "src/layouts"
import { queryClient } from "src/libs/react-query"

const RELOAD_KEY = "starlight:stale-build-reload"

/** 舊部署遺留的分頁會找不到新版的 chunk，這種錯誤重新載入即可恢復 */
const isStaleBuildError = (message: string) =>
  /Loading (CSS )?chunk|dynamically imported (module|chunk)|ChunkLoadError/i.test(
    message
  )

const useStaleBuildRecovery = () => {
  useEffect(() => {
    const reload = (message: string) => {
      if (!isStaleBuildError(message)) return

      let last = 0
      try {
        last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0)
      } catch {
        // sessionStorage 被封鎖時直接略過防迴圈檢查
      }

      // 60 秒內只自動重載一次，避免真的壞掉時無限重整
      if (Date.now() - last < 60000) return

      try {
        window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
      } catch {
        // ignore
      }

      window.location.reload()
    }

    const onError = (event: ErrorEvent) => reload(String(event.message || ""))
    const onRejection = (event: PromiseRejectionEvent) =>
      reload(String(event.reason?.message ?? event.reason ?? ""))

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejection)
    }
  }, [])
}

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page)

  useStaleBuildRecovery()

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
      </Hydrate>
    </QueryClientProvider>
  )
}

export default App
