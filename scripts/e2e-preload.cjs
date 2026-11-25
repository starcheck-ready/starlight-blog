// E2E 測試專用 preload：把頁面內的錯誤收集到 window.__e2eErrors
window.__e2eErrors = []

window.addEventListener("error", (event) => {
  window.__e2eErrors.push(String(event.message || event.error))
})

window.addEventListener("unhandledrejection", (event) => {
  window.__e2eErrors.push(`unhandledrejection: ${String(event.reason)}`)
})
