/**
 * 用 Electron 跑本機 E2E 檢查（不需要 Playwright／Puppeteer）。
 *
 * 用法：
 *   1. 先啟動服務：yarn build && yarn start -p 3000
 *   2. 執行：yarn e2e
 *
 * 可用環境變數覆寫：
 *   E2E_BASE_URL  (預設 http://localhost:3000)
 *   E2E_ARTICLE   (預設 /build-free-blog-in-30-mins)
 *   E2E_OUT_DIR   (截圖輸出目錄，預設 <tmp>/starlight-e2e)
 */
const { app, BrowserWindow } = require("electron")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")

const BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000"
const ARTICLE_PATH = process.env.E2E_ARTICLE || "/build-free-blog-in-30-mins"
const OUT_DIR =
  process.env.E2E_OUT_DIR || path.join(os.tmpdir(), "starlight-e2e")

const results = []

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail })
  console.log(
    `${ok ? "PASS" : "FAIL"} | ${name}${detail ? ` | ${detail}` : ""}`
  )
}

const evaluate = (win, code) => win.webContents.executeJavaScript(code, true)

async function waitFor(fn, { timeout = 20000, interval = 200 } = {}) {
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

const isHydrated = (win) =>
  waitFor(() => evaluate(win, "Boolean(window.next && window.next.router)"))

async function goto(win, urlPath) {
  await win.loadURL(`${BASE_URL}${urlPath}`)
  const hydrated = await isHydrated(win)
  await sleep(600)
  return hydrated
}

async function screenshot(win, filename, clip) {
  const image = await win.webContents.capturePage(clip)
  const target = path.join(OUT_DIR, filename)
  fs.writeFileSync(target, image.toPNG())
  return target
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const window = new BrowserWindow({
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
  window.webContents.on("console-message", (event) => {
    const value = event && event.level !== undefined ? event.level : undefined
    const text =
      event && event.message !== undefined ? event.message : String(event)
    if (value === "error" || value === 3) consoleErrors.push(String(text))
  })
  window.webContents.on("render-process-gone", (_event, details) => {
    consoleErrors.push(`render-process-gone: ${details.reason}`)
  })
  window.webContents.on("did-fail-load", (_event, code, description, url) => {
    consoleErrors.push(`did-fail-load(${code}) ${description} ${url}`)
  })

  // ---------- 文章頁：字級控制 ----------
  const articleHydrated = await goto(window, ARTICLE_PATH)
  check("文章頁 hydration 成功", articleHydrated)

  const initialScale = await evaluate(
    window,
    "document.querySelector('[data-reading-scale]')?.getAttribute('data-reading-scale')"
  )
  check("預設字級為 medium", initialScale === "medium", `got=${initialScale}`)

  const settings = await evaluate(
    window,
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

  check(
    "字級按鈕為 小/中/大",
    settings?.labels?.join(",") === "小,中,大",
    JSON.stringify(settings?.labels)
  )
  check(
    "大/中/小 文字垂直置中（偏移 ≤1.5px）",
    !!settings && settings.offsets.every((offset) => Math.abs(offset) <= 1.5),
    `offsets=${JSON.stringify(settings?.offsets)} sizes=${JSON.stringify(
      settings?.sizes
    )}`
  )

  const boxRect = await evaluate(
    window,
    `(() => {
      const box = document.querySelector('[aria-label="文章字級"]').getBoundingClientRect()
      return { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 }
    })()`
  )
  await screenshot(window, "01-reading-settings.png", boxRect)

  await evaluate(
    window,
    `document.querySelector('[aria-label="文章字級"] button[aria-label="字級大"]').click()`
  )
  await sleep(700)

  const afterClick = await evaluate(
    window,
    `({
      scale: document.querySelector('[data-reading-scale]')?.getAttribute('data-reading-scale'),
      stored: localStorage.getItem('starlight:reading-scale'),
      fontSize: getComputedStyle(document.querySelector('.notion')).fontSize,
      errors: window.__e2eErrors || [],
    })`
  )
  check(
    "點擊「大」字級生效",
    afterClick.scale === "large",
    `scale=${afterClick.scale}`
  )
  check(
    "字級寫入 localStorage",
    afterClick.stored === "large",
    `stored=${afterClick.stored}`
  )
  check(
    "內文實際變大（18px）",
    afterClick.fontSize === "18px",
    `fontSize=${afterClick.fontSize}`
  )
  check(
    "點擊過程無 JS 錯誤",
    afterClick.errors.length === 0,
    JSON.stringify(afterClick.errors)
  )

  await screenshot(window, "02-article-large.png")

  // ---------- 重新載入：字級是否保留 ----------
  window.webContents.reload()
  const reloadedHydrated = await isHydrated(window)
  await sleep(800)
  const afterReload = await evaluate(
    window,
    `({
      scale: document.querySelector('[data-reading-scale]')?.getAttribute('data-reading-scale'),
      fontSize: getComputedStyle(document.querySelector('.notion')).fontSize,
      errors: window.__e2eErrors || [],
    })`
  )
  check("重新載入後 hydration 成功", reloadedHydrated)
  check(
    "重新載入後字級保留 large",
    afterReload.scale === "large",
    `scale=${afterReload.scale}`
  )
  check(
    "重新載入後內文仍為 18px",
    afterReload.fontSize === "18px",
    `fontSize=${afterReload.fontSize}`
  )

  // ---------- 內頁：返回 + 首頁按鈕 ----------
  const archiveHydrated = await goto(window, "/archive")
  check("Archive 頁 hydration 成功", archiveHydrated)

  const nav = await evaluate(
    window,
    `({
      back: !!document.querySelector('[aria-label="返回"]'),
      home: !!document.querySelector('[aria-label="首頁"]'),
      homeTitle: document.querySelector('[aria-label="首頁"]')?.getAttribute('title') || null,
    })`
  )
  check("非首頁顯示「返回」按鈕", nav.back)
  check("非首頁顯示「首頁」按鈕", nav.home, `title=${nav.homeTitle}`)

  await screenshot(window, "03-archive-header.png", {
    x: 0,
    y: 0,
    width: 1280,
    height: 90,
  })

  await evaluate(
    window,
    `document.querySelector('[aria-label="首頁"]').click()`
  )
  const wentHome = await waitFor(
    async () => (await evaluate(window, "location.pathname")) === "/",
    { timeout: 15000 }
  )
  check(
    "點擊「首頁」回到 /",
    wentHome,
    `path=${await evaluate(window, "location.pathname")}`
  )

  const homeNav = await evaluate(
    window,
    `({
      home: !!document.querySelector('[aria-label="首頁"]'),
      back: !!document.querySelector('[aria-label="返回"]'),
      title: document.querySelector('.container > a[href="/"]')?.textContent?.trim() || null,
    })`
  )
  check("首頁不顯示返回/首頁按鈕", !homeNav.home && !homeNav.back)
  check("首頁左上顯示站名", !!homeNav.title, `title=${homeNav.title}`)

  await screenshot(window, "04-home.png")

  // ---------- 總結 ----------
  const pageErrors = await evaluate(window, "window.__e2eErrors || []")
  check(
    "全程無未捕捉錯誤 / console error",
    pageErrors.length === 0 && consoleErrors.length === 0,
    JSON.stringify({ pageErrors, consoleErrors })
  )

  const failed = results.filter((result) => !result.ok)
  console.log("")
  console.log(
    `=== ${results.length - failed.length}/${results.length} PASS ===`
  )
  console.log(`截圖輸出：${OUT_DIR}`)

  return failed.length === 0 ? 0 : 1
}

app.disableHardwareAcceleration()
app.commandLine.appendSwitch("disable-gpu")

const profileDir = path.join(os.tmpdir(), "starlight-e2e-profile")
fs.rmSync(profileDir, { recursive: true, force: true })
app.setPath("userData", profileDir)

const guard = setTimeout(() => {
  console.log("FAIL | E2E 逾時（180s）")
  app.exit(2)
}, 180000)

app.whenReady().then(async () => {
  let code = 2
  try {
    const probe = await fetch(BASE_URL, { method: "HEAD" }).catch(() => null)
    if (!probe) {
      console.log(`FAIL | 無法連線 ${BASE_URL}，請先執行 yarn start -p 3000`)
      app.exit(2)
      return
    }
  } catch {
    // 忽略，讓後續流程自行回報
  }

  try {
    code = await main()
  } catch (error) {
    console.log(
      `FAIL | E2E 執行例外：${error && error.stack ? error.stack : error}`
    )
    code = 1
  }

  clearTimeout(guard)
  app.exit(code)
})
