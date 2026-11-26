import Detail from "src/routes/Detail"
import { filterPosts } from "src/libs/utils/notion"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "../types"
import CustomError from "src/routes/Error"
import { getRecordMap, getPosts } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import JsonLd from "src/components/JsonLd"
import { getOgImageUrl } from "src/libs/ogImage"
import { GetStaticProps } from "next"
import { queryClient } from "src/libs/react-query"
import { queryKey } from "src/constants/queryKey"
import { dehydrate } from "@tanstack/react-query"
import usePostQuery from "src/hooks/usePostQuery"
import { FilterPostsOptions } from "src/libs/utils/notion/filterPosts"

const filter: FilterPostsOptions = {
  acceptStatus: ["Public", "PublicOnDetail", "Outdated"],
  acceptType: ["Paper", "Post", "Page"],
}

export const getStaticPaths = async () => {
  const posts = await getPosts()
  const filteredPost = filterPosts(posts, filter)

  return {
    paths: filteredPost.map((row) => `/${row.slug}`),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug

  const posts = await getPosts()
  const feedPosts = filterPosts(posts)
  await queryClient.prefetchQuery(queryKey.posts(), () => feedPosts)

  const detailPosts = filterPosts(posts, filter)
  const postDetail = detailPosts.find((t: any) => t.slug === slug)
  if (!postDetail) {
    return { notFound: true, revalidate: CONFIG.revalidateTime }
  }
  const recordMap = await getRecordMap(postDetail?.id!)

  await queryClient.prefetchQuery(queryKey.post(`${slug}`), () => ({
    ...postDetail,
    recordMap,
  }))

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const DetailPage: NextPageWithLayout = () => {
  const post = usePostQuery()

  if (!post) return <CustomError />

  const date = post.date?.start_date || post.createdTime || ""

  const image =
    post.thumbnail ??
    getOgImageUrl({
      title: post.title,
      description: post.summary || "",
      category: post.category?.[0],
      date,
    })

  const meta = {
    title: post.title,
    date: new Date(date).toISOString(),
    image: image,
    description: post.summary || "",
    type: post.type[0],
    url: `${CONFIG.link}/${post.slug}`,
    noindex: post.status?.[0] === "Outdated",
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": post.type[0] === "Page" ? "WebPage" : "Article",
        headline: post.title,
        name: post.title,
        description: post.summary || CONFIG.blog.description,
        image: image ? [image] : undefined,
        datePublished: new Date(date).toISOString(),
        dateModified: new Date(date).toISOString(),
        author: {
          "@type": "Person",
          name: post.author?.[0]?.name || CONFIG.profile.name,
        },
        publisher: {
          "@type": "Organization",
          name: CONFIG.blog.title,
          url: CONFIG.link,
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${CONFIG.link}/${post.slug}`,
        },
        ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
        ...(post.category?.length ? { articleSection: post.category[0] } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "首頁",
            item: CONFIG.link,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: post.title,
            item: `${CONFIG.link}/${post.slug}`,
          },
        ],
      },
    ],
  }

  return (
    <>
      <MetaConfig {...meta} />
      <JsonLd data={jsonLd} />
      <Detail />
    </>
  )
}

DetailPage.getLayout = (page) => {
  return <>{page}</>
}

export default DetailPage
