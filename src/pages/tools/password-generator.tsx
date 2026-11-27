import { CONFIG } from "site.config"
import MetaConfig from "src/components/MetaConfig"
import PasswordGenerator from "src/routes/Tools/PasswordGenerator"
import { NextPageWithLayout } from "src/types"

const PasswordGeneratorPage: NextPageWithLayout = () => {
  const meta = {
    title: `密碼產生器 | ${CONFIG.blog.title}`,
    description: "在瀏覽器本機產生隨機、易記或 PIN 密碼，不會上傳或儲存。",
    type: "website",
    url: `${CONFIG.link}/tools/password-generator`,
  }

  return (
    <>
      <MetaConfig {...meta} noindex />
      <PasswordGenerator />
    </>
  )
}

PasswordGeneratorPage.getLayout = (page) => {
  return <>{page}</>
}

export default PasswordGeneratorPage
