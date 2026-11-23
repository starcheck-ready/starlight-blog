import { CONFIG } from "site.config"
import Head from "next/head"
import { getOgImageUrl } from "src/libs/ogImage"

export type MetaConfigProps = {
  title: string
  description: string
  type: "Website" | "Post" | "Page" | string
  date?: string
  image?: string
  url: string
  noindex?: boolean
}

const MetaConfig: React.FC<MetaConfigProps> = (props) => {
  const image =
    props.image ??
    getOgImageUrl({
      title: props.title,
      description: props.description,
    })
  const isGeneratedImage = !props.image && !!CONFIG.ogImageGenerateURL

  return (
    <Head>
      <title>{props.title}</title>
      <meta
        name="robots"
        content={props.noindex ? "noindex, follow" : "follow, index"}
      />
      <meta charSet="UTF-8" />
      <meta name="description" content={props.description} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${CONFIG.blog.title} RSS`}
        href={`${CONFIG.link}/rss.xml`}
      />
      {/* og */}
      <meta property="og:type" content={props.type} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      <meta property="og:url" content={props.url} />
      {CONFIG.lang && <meta property="og:locale" content={CONFIG.lang} />}
      {image && <meta property="og:image" content={image} />}
      {image && isGeneratedImage && (
        <>
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content="image/png" />
        </>
      )}
      {image && <meta property="og:image:alt" content={props.title} />}
      {/* twitter */}
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:card" content="summary_large_image" />
      {image && <meta name="twitter:image" content={image} />}
      {image && <meta name="twitter:image:alt" content={props.title} />}
      {/* post */}
      {props.type === "Post" && (
        <>
          <meta property="article:published_time" content={props.date} />
          <meta property="article:author" content={CONFIG.profile.name} />
        </>
      )}
    </Head>
  )
}

export default MetaConfig
