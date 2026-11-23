import styled from "@emotion/styled"
import Link from "next/link"
import React from "react"

type Props = {
  children: string
  readOnly?: boolean
}

const Tag: React.FC<Props> = ({ children, readOnly = false }) => {
  if (readOnly) return <StyledReadOnly>{children}</StyledReadOnly>

  return (
    <StyledWrapper href={`/tags/${encodeURIComponent(children)}`}>
      {children}
    </StyledWrapper>
  )
}

export default Tag

const StyledWrapper = styled(Link)`
  display: inline-block;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray10};
  background-color: ${({ theme }) => theme.colors.gray5};
  text-decoration: none;
  cursor: pointer;

  :hover {
    color: ${({ theme }) => theme.colors.gray12};
  }
`

const StyledReadOnly = styled.span`
  display: inline-block;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.gray10};
  background-color: ${({ theme }) => theme.colors.gray5};
`
