import { CONFIG } from "site.config"

// bump this when the OG layout changes so social platforms refetch the image
const OG_VERSION = "2"

type OgImageParams = {
  title: string
  description?: string
  category?: string
  date?: string
}

export const getOgImageUrl = ({
  title,
  description,
  category,
  date,
}: OgImageParams) => {
  if (!CONFIG.ogImageGenerateURL) return undefined

  const url = new URL(CONFIG.ogImageGenerateURL)
  url.searchParams.set("v", OG_VERSION)
  url.searchParams.set("title", title)
  if (description) url.searchParams.set("description", description)
  if (category) url.searchParams.set("category", category)
  if (date) url.searchParams.set("date", date)

  return url.toString()
}
