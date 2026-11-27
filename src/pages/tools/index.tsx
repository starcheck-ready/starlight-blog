import { CONFIG } from "site.config"
import MetaConfig from "src/components/MetaConfig"
import Tools from "src/routes/Tools"
import { NextPageWithLayout } from "src/types"

const ToolsPage: NextPageWithLayout = () => {
  const meta = {
    title: `小工具 | ${CONFIG.blog.title}`,
    description: "在瀏覽器就能使用的小工具，資料不會離開你的裝置。",
    type: "website",
    url: `${CONFIG.link}/tools`,
  }

  return (
    <>
      <MetaConfig {...meta} noindex />
      <Tools />
    </>
  )
}

ToolsPage.getLayout = (page) => {
  return <>{page}</>
}

export default ToolsPage
