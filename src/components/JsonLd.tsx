import Head from "next/head"
import React from "react"

type Props = {
  data: Record<string, unknown>
}

const JsonLd: React.FC<Props> = ({ data }) => {
  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  )
}

export default JsonLd
