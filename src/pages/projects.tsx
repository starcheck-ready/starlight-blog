import { dehydrate } from "@tanstack/react-query"
import { GetStaticProps } from "next"
import MetaConfig from "src/components/MetaConfig"
import { queryKey } from "src/constants/queryKey"
import { getPosts } from "src/apis"
import { queryClient } from "src/libs/react-query"
import { filterPosts } from "src/libs/utils/notion"
import Projects from "src/routes/Projects"
import { CONFIG } from "site.config"
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

const ProjectsPage: NextPageWithLayout = () => {
  const meta = {
    title: `Projects | ${CONFIG.blog.title}`,
    description: CONFIG.blog.description,
    type: "website",
    url: `${CONFIG.link}/projects`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Projects />
    </>
  )
}

export default ProjectsPage
