import { GetStaticProps } from "next"
import { CONFIG } from "site.config"
import MetaConfig from "src/components/MetaConfig"
import { getGuideSummaries, GuideSummary } from "src/libs/guidesData"
import Todo from "src/routes/Todo"
import { NextPageWithLayout } from "src/types"

type Props = {
  guides: GuideSummary[]
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  return {
    props: { guides: await getGuideSummaries() },
    revalidate: CONFIG.revalidateTime,
  }
}

const TodoPage: NextPageWithLayout<Props> = ({ guides }) => {
  const meta = {
    title: `待辦清單 | ${CONFIG.blog.title}`,
    description: "攻略 checklist 中尚未完成的項目。",
    type: "website",
    url: `${CONFIG.link}/todo`,
  }

  return (
    <>
      <MetaConfig {...meta} noindex />
      <Todo guides={guides} />
    </>
  )
}

TodoPage.getLayout = (page) => {
  return <>{page}</>
}

export default TodoPage
