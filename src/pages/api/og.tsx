import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { CONFIG } from "site.config"

export const config = {
  runtime: "edge",
}

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawTitle = searchParams.get("title") || CONFIG.blog.title
  const titleSize = rawTitle.length > 56 ? 54 : rawTitle.length > 32 ? 64 : 76
  const title = truncate(
    rawTitle,
    titleSize === 54 ? 54 : titleSize === 64 ? 48 : 40
  )
  const description = truncate(
    searchParams.get("description") || CONFIG.blog.description,
    70
  )
  const category = searchParams.get("category") || ""
  const date = truncate(searchParams.get("date") || "", 16)

  const [boldFont, regularFont] = await Promise.all(
    ["bold", "regular"].map((weight) =>
      fetch(new URL(`/fonts/og-pretendard-${weight}.ttf`, req.url), {
        cache: "force-cache",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to load OG font")
        return res.arrayBuffer()
      })
    )
  )

  const domain = CONFIG.link.replace(/^https?:\/\//, "")

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #18181b 0%, #27272a 55%, #312e81 100%)",
          color: "#fafafa",
          fontFamily: "Pretendard",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: "#a1a1aa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: "#818cf8",
              }}
            />
            <span>{CONFIG.blog.title}</span>
          </div>
          {category ? (
            <span style={{ color: "#c7d2fe" }}>{category}</span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: 1040,
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              overflow: "hidden",
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-1px",
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                overflow: "hidden",
                fontSize: 28,
                lineHeight: 1.5,
                color: "#a1a1aa",
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#71717a",
          }}
        >
          <span>{date || CONFIG.blog.description}</span>
          <span>{domain}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Pretendard",
          data: boldFont,
          weight: 700,
          style: "normal",
        },
        {
          name: "Pretendard",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control":
          "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
      },
    }
  )
}
