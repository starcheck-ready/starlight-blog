import Link from "next/link"
import React from "react"
import { COLOR_SET } from "./constants"
import styled from "@emotion/styled"
import { colors } from "src/styles"

export const getColorClassByName = (name: string): string => {
  try {
    let sum = 0
    name.split("").forEach((alphabet) => (sum = sum + alphabet.charCodeAt(0)))
    const colorKey = sum
      .toString(16)
      ?.[sum.toString(16).length - 1].toUpperCase()
    return COLOR_SET[colorKey]
  } catch {
    return COLOR_SET[0]
  }
}

type Props = {
  children: string
  readOnly?: boolean
}

const Category: React.FC<Props> = ({ readOnly = false, children }) => {
  const backgroundColor = getColorClassByName(children)

  if (readOnly) {
    return <StyledReadOnly css={{ backgroundColor }}>{children}</StyledReadOnly>
  }

  return (
    <StyledLink
      href={`/categories/${encodeURIComponent(children)}`}
      css={{ backgroundColor }}
    >
      {children}
    </StyledLink>
  )
}

export default Category

const baseStyles = `
  display: inline-block;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 9999px;
  width: fit-content;
  font-size: 0.875rem;
  line-height: 1.25rem;
  opacity: 0.9;
  color: ${colors.dark.gray1};
  text-decoration: none;
`

const StyledLink = styled(Link)`
  ${baseStyles}
  cursor: pointer;
`

const StyledReadOnly = styled.span`
  ${baseStyles}
  cursor: default;
`
