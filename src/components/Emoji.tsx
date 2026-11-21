import React, { ReactNode } from "react"

type Props = {
  className?: string
  children?: ReactNode
}

const EMOJI_FONT_FAMILY =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Android Emoji", sans-serif'

export const Emoji = ({ className, children }: Props) => {
  return (
    <span className={className} css={{ fontFamily: EMOJI_FONT_FAMILY }}>
      {children}
    </span>
  )
}
