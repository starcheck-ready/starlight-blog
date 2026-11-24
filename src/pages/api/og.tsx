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
  const titleSize = rawTitle.length > 30 ? 46 : rawTitle.length > 18 ? 52 : 60
  const title = truncate(rawTitle, 32)
  const date = truncate(searchParams.get("date") || "", 16)
  const domain = CONFIG.link.replace(/^https?:\/\//, "")

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
          padding: "56px 64px",
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
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={new URL("/avatar.png", req.url).toString()}
            width={300}
            height={300}
            style={{ borderRadius: 48 }}
            alt=""
          />
          <div
            style={{
              display: "flex",
              maxWidth: 820,
              justifyContent: "center",
              overflow: "hidden",
              textAlign: "center",
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-1px",
            }}
          >
            {title}
          </div>
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
