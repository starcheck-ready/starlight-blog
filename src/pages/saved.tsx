import { GetStaticProps } from "next"
import { CONFIG } from "site.config"
import { getPosts } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { filterPosts } from "src/libs/utils/notion"
import { queryClient } from "src/libs/react-query"
import { queryKey } from "src/constants/queryKey"
import { dehydrate } from "@tanstack/react-query"
import Saved from "src/routes/Saved"
import { NextPageWithLayout } from "src/types"

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

const SavedPage: NextPageWithLayout = () => {
  const meta = {
    title: `收藏 | ${CONFIG.blog.title}`,
    description: "你在本站收藏的文章。",
    type: "website",
    url: `${CONFIG.link}/saved`,
  }

  return (
    <>
      <MetaConfig {...meta} noindex />
      <Saved />
    </>
  )
}

SavedPage.getLayout = (page) => {
  return <>{page}</>
}

export default SavedPage
