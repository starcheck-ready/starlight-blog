import type { NextApiRequest, NextApiResponse } from "next"
import sharp from "sharp"

const ALLOWED_HOSTS = [
  "www.notion.so",
  "app.notion.com",
  "file.notion.com",
  "img.notionusercontent.com",
  "s3-us-west-2.amazonaws.com",
]

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

const isAllowedHost = (hostname: string) =>
  ALLOWED_HOSTS.includes(hostname) ||
  hostname.endsWith(".amazonaws.com") ||
  hostname.endsWith(".googleusercontent.com") ||
  hostname.endsWith(".gstatic.com")

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const rawUrl = typeof req.query.url === "string" ? req.query.url : ""
  const width = clamp(Number(req.query.w) || 1200, 1, 3840)
  const quality = clamp(Number(req.query.q) || 75, 1, 100)

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    res.status(400).send("Invalid image url")
    return
  }

  if (!isAllowedHost(url.hostname)) {
    res.status(400).send("Image host is not allowed")
    return
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        "user-agent": USER_AGENT,
        accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
    })

    if (!upstream.ok) {
      res.status(upstream.status).send("Failed to fetch image")
      return
    }

    const contentType = upstream.headers.get("content-type") ?? ""
    if (!contentType.startsWith("image/") || contentType.includes("svg")) {
      res.status(415).send("Unsupported image type")
      return
    }

    const contentLength = Number(upstream.headers.get("content-length") || 0)
    if (contentLength > 15 * 1024 * 1024) {
      res.status(413).send("Image is too large")
      return
    }

    const input = Buffer.from(await upstream.arrayBuffer())
    if (input.length > 15 * 1024 * 1024) {
      res.status(413).send("Image is too large")
      return
    }
    const output = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer()

    res.setHeader("Content-Type", "image/webp")
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=31536000, stale-while-revalidate=86400"
    )
    res.send(output)
  } catch {
    res.status(502).send("Image proxy failed")
  }
}
