import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { CONFIG } from "site.config"

export const config = {
  runtime: "edge",
}

const truncate = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1)}…` : value

const truncateClause = (value: string, max: number) => {
  if (value.length <= max) return value

  const slice = value.slice(0, max)
  const cut = Math.max(
    slice.lastIndexOf("，"),
    slice.lastIndexOf("。"),
    slice.lastIndexOf("、"),
    slice.lastIndexOf("；")
  )

  if (cut > max - 20) return `${value.slice(0, cut)}…`
  return `${value.slice(0, max - 1)}…`
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawTitle = searchParams.get("title") || CONFIG.blog.title
  const titleSize = rawTitle.length > 56 ? 54 : rawTitle.length > 32 ? 64 : 76
  const titleMax = titleSize === 54 ? 60 : titleSize === 64 ? 44 : 28
  const title = truncate(rawTitle, titleMax)
  const description = truncateClause(
    searchParams.get("description") || CONFIG.blog.description,
    52
  )
  const category = truncate(searchParams.get("category") || "", 12)
  const date = truncate(searchParams.get("date") || "", 16)
  const domain = CONFIG.link.replace(/^https?:\/\//, "")
  const showBrand = rawTitle !== CONFIG.blog.title

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

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "48px 64px",
          flexDirection: "column",
          alignItems: "center",
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
            height: 34,
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            color: "#a1a1aa",
          }}
        >
          {showBrand && (
            <>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 9999,
                  backgroundColor: "#818cf8",
                }}
              />
              <span>{CONFIG.blog.title}</span>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            maxWidth: 760,
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 16,
          }}
        >
          {category ? (
            <div
              style={{
                display: "flex",
                padding: "6px 18px",
                borderRadius: 9999,
                backgroundColor: "rgba(129, 140, 248, 0.16)",
                color: "#c7d2fe",
                fontSize: 24,
              }}
            >
              {category}
            </div>
          ) : null}
          <div
            style={{
              overflow: "hidden",
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.2,
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
                lineHeight: 1.45,
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
            height: 30,
            alignItems: "center",
            gap: 10,
            fontSize: 22,
            color: "#71717a",
          }}
        >
          {date ? (
            <>
              <span>{date}</span>
              <span>·</span>
            </>
          ) : null}
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
