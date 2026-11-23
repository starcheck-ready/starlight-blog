const OPTIMIZABLE_HOSTS = [
  "www.notion.so",
  "app.notion.com",
  "file.notion.com",
  "img.notionusercontent.com",
  "s3-us-west-2.amazonaws.com",
]

const isOptimizableHost = (hostname: string) =>
  OPTIMIZABLE_HOSTS.includes(hostname) ||
  hostname.endsWith(".amazonaws.com") ||
  hostname.endsWith(".googleusercontent.com") ||
  hostname.endsWith(".gstatic.com")

export const getOptimizedImageUrl = (
  src: string,
  width: number,
  quality = 75
) => {
  if (
    !src ||
    src.startsWith("/") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  ) {
    return src
  }

  let url: URL
  try {
    url = new URL(src)
  } catch {
    return src
  }

  if (url.pathname.toLowerCase().endsWith(".svg")) return src
  if (!isOptimizableHost(url.hostname)) return src

  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality),
  })

  return `/api/image?${params.toString()}`
}
