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
  const categories = Object.keys(getAllSelectItemsFromPosts("category", posts))

  return {
    paths: categories.map((category) => ({ params: { category } })),
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

const CategoryPage: NextPageWithLayout = () => {
  const router = useRouter()
  const category =
    typeof router.query.category === "string" ? router.query.category : ""
  const meta = {
    title: `${category} | ${CONFIG.blog.title}`,
    description: CONFIG.blog.description,
    type: "website",
    url: `${CONFIG.link}/categories/${encodeURIComponent(category)}`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Taxonomy kind="category" value={category} />
    </>
  )
}

export default CategoryPage
