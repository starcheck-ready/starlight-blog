import { GetStaticProps } from "next"
import { CONFIG } from "site.config"
import MetaConfig from "src/components/MetaConfig"
import { getGuideSummaries, GuideSummary } from "src/libs/guidesData"
import Guides from "src/routes/Guides"
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

const GuidesPage: NextPageWithLayout<Props> = ({ guides }) => {
  const meta = {
    title: `攻略總覽 | ${CONFIG.blog.title}`,
    description: "整理站內所有遊戲攻略與個人完成進度。",
    type: "website",
    url: `${CONFIG.link}/guides`,
  }

  return (
    <>
      <MetaConfig {...meta} />
      <Guides guides={guides} />
    </>
  )
}

GuidesPage.getLayout = (page) => {
  return <>{page}</>
}

export default GuidesPage
