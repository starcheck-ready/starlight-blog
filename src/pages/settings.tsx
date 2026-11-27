import { CONFIG } from "site.config"
import MetaConfig from "src/components/MetaConfig"
import Settings from "src/routes/Settings"
import { NextPageWithLayout } from "src/types"

const SettingsPage: NextPageWithLayout = () => {
  const meta = {
    title: `設定 | ${CONFIG.blog.title}`,
    description: "網站外觀、RSS 訂閱與本機資料設定。",
    type: "website",
    url: `${CONFIG.link}/settings`,
  }

  return (
    <>
      <MetaConfig {...meta} noindex />
      <Settings />
    </>
  )
}

SettingsPage.getLayout = (page) => {
  return <>{page}</>
}

export default SettingsPage
