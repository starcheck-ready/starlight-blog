import { GetStaticProps } from "next"
import { CONFIG } from "site.config"
import { getPosts } from "src/apis"
import MetaConfig from "src/components/MetaConfig"
import { filterPosts } from "src/libs/utils/notion"
import Status from "src/routes/Status"
import { NextPageWithLayout, TPosts } from "src/types"

type Props = {
  posts: TPosts
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const posts = filterPosts(await getPosts(), {
    acceptStatus: ["Public", "Outdated"],
    acceptType: ["Post"],
  })

  return {
    props: { posts },
    revalidate: CONFIG.revalidateTime,
  }
}

const StatusPage: NextPageWithLayout<Props> = ({ posts }) => {
  const meta = {
    title: `內容健檢 | ${CONFIG.blog.title}`,
    description: "站長用的內容維護檢查頁。",
    type: "website",
    url: `${CONFIG.link}/status`,
  }

  return (
    <>
      <MetaConfig {...meta} noindex />
      <Status posts={posts} />
    </>
  )
}

StatusPage.getLayout = (page) => {
  return <>{page}</>
}

export default StatusPage
