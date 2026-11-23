import { dehydrate } from "@tanstack/react-query"
import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from "next/router"
import MetaConfig from "src/components/MetaConfig"
import { queryKey } from "src/constants/queryKey"
import { getPosts } from "src/apis"
import { queryClient } from "src/libs/react-query"
import { filterPosts, getAllSelectItemsFromPosts } from "src/libs/utils/notion"
import Taxonomy from "src/routes/Taxonomy"
import { CONFIG } from "site.config"
import { NextPageWithLayout } from "src/types"

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = filterPosts(await getPosts())
  const tags = Object.keys(getAllSelectItemsFromPosts("tags", posts)).filter(
    (tag) => tag !== "Pinned"
  )

  return {
    paths: tags.map((tag) => ({ params: { tag } })),
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = filterPosts(await getPosts())
  await queryClient.prefetchQuery(queryKey.posts(), () => posts)

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: CONFIG.revalidateTime,
  }
}

const TagPage: NextPageWithLayout = () => {
  const router = useRouter()
  const tag = typeof router.query.tag === "string" ? router.query.tag : ""
  const meta = {
    title: `${tag} | ${CONFIG.blog.title}`,
    description: CONFIG.blog.description,
    type: "website",
    url: `${CONFIG.link}/tags/${encodeURIComponent(tag)}`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Taxonomy kind="tag" value={tag} />
    </>
  )
}

export default TagPage
