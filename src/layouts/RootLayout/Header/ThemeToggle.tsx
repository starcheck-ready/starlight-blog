import styled from "@emotion/styled"
import React from "react"
import { Emoji } from "src/components/Emoji"
import useScheme from "src/hooks/useScheme"

type Props = {}

const ThemeToggle: React.FC<Props> = () => {
  const [scheme, setScheme] = useScheme()

  const handleClick = () => {
    setScheme(scheme === "light" ? "dark" : "light")
  }

  return (
    <StyledWrapper
      type="button"
      onClick={handleClick}
      aria-label={`切換至${scheme === "light" ? "深色" : "淺色"}模式`}
    >
      <Emoji>{scheme === "light" ? "☀️" : "🌙"}</Emoji>
    </StyledWrapper>
  )
}

export default ThemeToggle

const StyledWrapper = styled.button`
  display: inline-flex;
  width: 2.125rem;
  height: 2.125rem;
  padding: 0;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9999px;
  background: transparent;
  font-size: 1rem;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.colors.gray5};
  }

  @media (max-width: 480px) {
    width: 2rem;
    height: 2rem;
  }
`
