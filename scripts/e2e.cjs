/**
 * 用 Electron 跑本機 E2E 檢查（不需要 Playwright／Puppeteer）。
 *
 * 用法：
 *   1. 先啟動服務：yarn build && yarn start -p 3000
 *   2. 執行一次：yarn e2e
 *      修改檔案後自動重跑：yarn e2e:watch
 *
 * 可用環境變數覆寫：
 *   E2E_BASE_URL  (預設 http://localhost:3000)
 *   E2E_ARTICLE   (預設 /build-free-blog-in-30-mins)
 *   E2E_OUT_DIR   (截圖輸出目錄，預設 <tmp>/starlight-e2e)
 */
const { app, BrowserWindow, session } = require("electron")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000"
const ARTICLE_PATH = process.env.E2E_ARTICLE || "/build-free-blog-in-30-mins"
const OUT_DIR =
  process.env.E2E_OUT_DIR || path.join(os.tmpdir(), "starlight-e2e")
const WATCH = process.argv.includes("--watch")
const WATCH_TARGETS = ["src", "site.config.ts"]
const watchers = []

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const evaluate = (win, code) => win.webContents.executeJavaScript(code, true)

async function withTimeout(promise, ms, label) {
  let timer
  const timeout = new Promise((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} 逾時 ${ms}ms`)), ms)
  })
  try {
    return await Promise.race([promise, timeout])
  } finally {
    clearTimeout(timer)
  }
}

async function waitFor(fn, { timeout = 15000, interval = 100 } = {}) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    try {
      if (await fn()) return true
    } catch {
      // 頁面切換中可能短暫失敗，忽略
    }
    await sleep(interval)
  }
  return false
}

async function screenshot(win, filename, clip) {
  const image = await win.webContents.capturePage(clip)
  fs.writeFileSync(path.join(OUT_DIR, filename), image.toPNG())
}

function createRecorder() {
  const items = []
  const record = (name, ok, detail = "") => {
    items.push({ name, ok, detail })
    console.log(
      `${ok ? "PASS" : "FAIL"} | ${name}${detail ? ` | ${detail}` : ""}`
    )
  }
  return { items, record }
}

/** 載入頁面並等到「已 hydration + 目標元素出現」 */
async function goto(win, urlPath, readySelector, timeout = 30000) {
  await withTimeout(
    win.loadURL(`${BASE_URL}${urlPath}`),
    timeout,
    `載入 ${urlPath}`
  )
  return waitFor(
    () =>
      evaluate(
        win,
        `Boolean(window.next && window.next.router)
          && Boolean(document.querySelector(${JSON.stringify(readySelector)}))`
      ),
    { timeout }
  )
}

/** 等版面穩定（連續兩次量到的位置大小一致），避免在字型/圖片載入中量測 */
async function waitStableLayout(win, selector, timeout = 3000) {
  let last = ""
  return waitFor(
    async () => {
      const rect = await evaluate(
        win,
        `(() => {
          const el = document.querySelector(${JSON.stringify(selector)})
          if (!el) return null
          const box = el.getBoundingClientRect()
          return [box.x, box.y, box.width, box.height]
            .map((value) => Math.round(value * 10) / 10)
            .join(",")
        })()`
      )
      if (!rect) return false
      const stable = rect === last
      last = rect
      return stable
    },
    { timeout, interval: 100 }
  )
}

async function runSuite() {
  const { items, record } = createRecorder()

  await session.defaultSession
    .clearStorageData({ storages: ["localstorage"] })
    .catch(() => {})

  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "e2e-preload.cjs"),
      contextIsolation: false,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  })

  const consoleErrors = []
  win.webContents.on("console-message", (event) => {
    const level = event && event.level
    const message = event && event.message
    if (level === "error") consoleErrors.push(String(message))
  })
  win.webContents.on("render-process-gone", (_event, details) => {
    consoleErrors.push(`render-process-gone: ${details.reason}`)
  })
  win.webContents.on("did-fail-load", (_event, code, description, url) => {
    consoleErrors.push(`did-fail-load(${code}) ${description} ${url}`)
  })

  try {
    // ---------- 文章頁：字級控制 ----------
    const articleReady = await goto(
      win,
      ARTICLE_PATH,
      '[aria-label="文章字級"]'
    )
    record("文章頁 hydration 成功", articleReady)
    if (!articleReady) {
      const diag = await evaluate(
        win,
        `({
          url: location.href,
          next: Boolean(window.next),
          router: Boolean(window.next && window.next.router),
          selector: Boolean(document.querySelector('[aria-label="文章字級"]')),
        })`
      )
      console.log(`  ↳ 診斷：${JSON.stringify(diag)}`)
      return items
    }

    await waitStableLayout(win, '[aria-label="文章字級"]')

    const initialScale = await evaluate(
      win,
      "document.documentElement.getAttribute('data-reading-scale')"
    )
    record(
      "預設字級為 medium",
      initialScale === "medium",
      `got=${initialScale}`
    )

    const settings = await evaluate(
      win,
      `(() => {
        const group = document.querySelector('[aria-label="文章字級"]')
        if (!group) return null
        const buttons = [...group.querySelectorAll('button')]
        return {
          labels: buttons.map((button) => button.textContent.trim()),
          offsets: buttons.map((button) => {
            const box = button.getBoundingClientRect()
            const range = document.createRange()
            range.selectNodeContents(button)
            const text = range.getBoundingClientRect()
            return Math.round(((text.top + text.bottom) / 2 - (box.top + box.bottom) / 2) * 10) / 10
          }),
          sizes: buttons.map((button) => {
            const box = button.getBoundingClientRect()
            return [Math.round(box.width), Math.round(box.height)]
          }),
        }
      })()`
    )

    record(
      "字級按鈕為 小/中/大",
      settings?.labels?.join(",") === "小,中,大",
      JSON.stringify(settings?.labels)
    )
    record(
      "大/中/小 文字垂直置中（偏移 ≤1.5px）",
      !!settings && settings.offsets.every((offset) => Math.abs(offset) <= 1.5),
      `offsets=${JSON.stringify(settings?.offsets)} sizes=${JSON.stringify(
        settings?.sizes
      )}`
    )

    const pillRect = await evaluate(
      win,
      `(() => {
        const box = document.querySelector('[aria-label="文章字級"]').getBoundingClientRect()
        return { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 }
      })()`
    )
    await screenshot(win, "01-reading-settings.png", pillRect)

    await evaluate(
      win,
      `document.querySelector('[aria-label="文章字級"] button[aria-label="字級大"]').click()`
    )
    const switched = await waitFor(
      () =>
        evaluate(
          win,
          `document.documentElement.getAttribute('data-reading-scale') === "large"`
        ),
      { timeout: 5000 }
    )
    record("點擊「大」字級立即生效", switched)

    const afterClick = await evaluate(
      win,
      `({
        scale: document.documentElement.getAttribute('data-reading-scale'),
        stored: localStorage.getItem('starlight:reading-scale'),
        fontSize: getComputedStyle(document.querySelector('.notion')).fontSize,
        errors: window.__e2eErrors || [],
      })`
    )
    record(
      "字級寫入 localStorage",
      afterClick.stored === "large",
      `stored=${afterClick.stored}`
    )
    record(
      "內文實際變大（18px）",
      afterClick.fontSize === "18px",
      `fontSize=${afterClick.fontSize}`
    )
    record(
      "點擊過程無 JS 錯誤",
      afterClick.errors.length === 0,
      JSON.stringify(afterClick.errors)
    )

    await screenshot(win, "02-article-large.png")

    // ---------- 連續切換字級：確認主執行緒不會被卡住 ----------
    for (const label of ["字級小", "字級中", "字級大"]) {
      await evaluate(
        win,
        `document.querySelector('[aria-label="文章字級"] button[aria-label="${label}"]').click()`
      )
    }
    const responsiveness = await evaluate(
      win,
      `new Promise((resolve) => {
        const start = performance.now()
        setTimeout(() => {
          resolve({
            lag: Math.round(performance.now() - start),
            scale: document.documentElement.getAttribute('data-reading-scale'),
          })
        }, 50)
      })`
    )
    record(
      "連續切換字級後頁面仍可回應（主執行緒 unblock）",
      responsiveness.lag < 500 && responsiveness.scale === "large",
      `lag=${responsiveness.lag}ms scale=${responsiveness.scale}`
    )

    // ---------- 重新載入：字級是否保留 ----------
    // 先把 localStorage 寫入磁碟，否則緊接 reload 會讀不到（Chromium 非同步落盤）
    await session.defaultSession.flushStorageData()
    win.webContents.reload()
    const reloadedReady = await waitFor(
      () =>
        evaluate(
          win,
          `Boolean(window.next && window.next.router)
            && Boolean(document.querySelector('[aria-label="文章字級"]'))`
        ),
      { timeout: 30000 }
    )
    record("重新載入後 hydration 成功", reloadedReady)

    // SSR 一律輸出 medium，要等 useEffect 讀回 localStorage 後才會變 large
    const keptScale = await waitFor(
      () =>
        evaluate(
          win,
          `document.documentElement.getAttribute('data-reading-scale') === "large"`
        ),
      { timeout: 5000 }
    )
    record("重新載入後字級保留 large", keptScale)

    const afterReload = await evaluate(
      win,
      `({ fontSize: getComputedStyle(document.querySelector('.notion')).fontSize })`
    )
    record(
      "重新載入後內文仍為 18px",
      afterReload.fontSize === "18px",
      `fontSize=${afterReload.fontSize}`
    )

    // ---------- 內頁：返回 + 首頁按鈕 ----------
    const archiveReady = await goto(win, "/archive", '[aria-label="首頁"]')
    record("Archive 頁 hydration 成功", archiveReady)

    const nav = archiveReady
      ? await evaluate(
          win,
          `({
            back: !!document.querySelector('[aria-label="返回"]'),
            home: !!document.querySelector('[aria-label="首頁"]'),
            homeTitle: document.querySelector('[aria-label="首頁"]')?.getAttribute('title') || null,
          })`
        )
      : {}
    record("非首頁顯示「返回」按鈕", nav.back === true)
    record(
      "非首頁顯示「首頁」按鈕",
      nav.home === true,
      `title=${nav.homeTitle}`
    )

    await screenshot(win, "03-archive-header.png", {
      x: 0,
      y: 0,
      width: 1280,
      height: 90,
    })

    const clicked = await evaluate(
      win,
      `(() => {
        const button = document.querySelector('[aria-label="首頁"]')
        if (!button) return false
        button.click()
        return true
      })()`
    )
    const wentHome =
      clicked &&
      (await waitFor(
        async () => (await evaluate(win, "location.pathname")) === "/",
        {
          timeout: 10000,
        }
      ))
    record(
      "點擊「首頁」回到 /",
      wentHome,
      `path=${await evaluate(win, "location.pathname")}`
    )

    const homeNav = wentHome
      ? await evaluate(
          win,
          `({
            home: !!document.querySelector('[aria-label="首頁"]'),
            back: !!document.querySelector('[aria-label="返回"]'),
            title: document.querySelector('.container > a[href="/"]')?.textContent?.trim() || null,
          })`
        )
      : {}
    record("首頁不顯示返回/首頁按鈕", !homeNav.home && !homeNav.back)
    record("首頁左上顯示站名", !!homeNav.title, `title=${homeNav.title}`)

    await screenshot(win, "04-home.png")

    // ---------- 總結 ----------
    const pageErrors = await evaluate(win, "window.__e2eErrors || []")
    record(
      "全程無未捕捉錯誤 / console error",
      pageErrors.length === 0 && consoleErrors.length === 0,
      JSON.stringify({ pageErrors, consoleErrors })
    )

    // ---------- 舊 build 的 chunk 404：應自動重新載入 ----------
    const reloadStarted = new Promise((resolve) => {
      const handler = () => {
        win.webContents.off("did-start-loading", handler)
        resolve(true)
      }
      win.webContents.on("did-start-loading", handler)
    })
    await evaluate(
      win,
      `(window.dispatchEvent(
        new ErrorEvent("error", { message: "Loading chunk 1234 failed." })
      ), true)`
    )
    const recovered = await Promise.race([
      reloadStarted,
      sleep(3000).then(() => false),
    ])
    record("舊 build 的 chunk 404 會自動重新載入", recovered === true)
  } finally {
    win.destroy()
  }

  return items
}

async function execute() {
  const startedAt = Date.now()
  console.log(`\n=== E2E ${new Date().toLocaleTimeString("zh-TW")} ===`)
  const items = await runSuite()
  const failed = items.filter((item) => !item.ok)
  console.log(
    `=== ${items.length - failed.length}/${items.length} PASS · ${(
      (Date.now() - startedAt) /
      1000
    ).toFixed(1)}s === 截圖：${OUT_DIR}`
  )
  return failed.length === 0
}

app.disableHardwareAcceleration()
app.commandLine.appendSwitch("disable-gpu")

// 預設「所有視窗關閉就退出」會讓 watch 模式跑完第一輪就結束，這裡接管退出時機
app.on("window-all-closed", () => {
  // 一次性模式由 app.exit() 收尾；watch 模式需保持存活等待檔案變更
})

const profileDir = path.join(os.tmpdir(), "starlight-e2e-profile")
fs.rmSync(profileDir, { recursive: true, force: true })
app.setPath("userData", profileDir)

app.whenReady().then(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const probe = await fetch(BASE_URL, { method: "HEAD" }).catch(() => null)
  if (!probe) {
    console.log(`FAIL | 無法連線 ${BASE_URL}，請先執行 yarn start -p 3000`)
    app.exit(2)
    return
  }

  if (!WATCH) {
    let ok = false
    try {
      ok = await execute()
    } catch (error) {
      console.log(
        `FAIL | E2E 執行例外：${error && error.stack ? error.stack : error}`
      )
    }
    app.exit(ok ? 0 : 1)
    return
  }

  let running = false
  let pending = false

  const rerun = async () => {
    if (running) {
      pending = true
      return
    }
    running = true
    try {
      await execute()
    } catch (error) {
      console.log(
        `FAIL | E2E 執行例外：${error && error.stack ? error.stack : error}`
      )
    }
    running = false
    if (pending) {
      pending = false
      await rerun()
    }
  }

  await rerun()

  let timer = null
  const onChange = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      console.log("\n偵測到檔案變更，重新執行…")
      rerun()
    }, 300)
  }

  WATCH_TARGETS.forEach((target) => {
    const full = path.join(process.cwd(), target)
    if (!fs.existsSync(full)) return
    watchers.push(fs.watch(full, { recursive: true }, onChange))
    console.log(`監看：${full}`)
  })

  console.log(
    "\nwatch 模式：修改 src/ 或 site.config.ts 會自動重跑（Ctrl+C 結束）"
  )
})
