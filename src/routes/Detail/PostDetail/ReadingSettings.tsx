import { Global, css } from "@emotion/react"
import styled from "@emotion/styled"
import React, { useEffect, useState } from "react"
import {
  READING_SCALE_EVENT,
  READING_SCALES,
  ReadingScale,
  readReadingScale,
  writeReadingScale,
} from "src/libs/readingScale"

/**
 * 字級只靠 <html data-reading-scale> 上的全域 CSS 生效，
 * 不經過文章元件的 React state，避免切換時重繪整棵 Notion 樹。
 */
const scaleStyles = css`
  html[data-reading-scale="small"] .notion {
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  html[data-reading-scale="medium"] .notion {
    font-size: 1rem;
    line-height: 1.65;
  }

  html[data-reading-scale="large"] .notion {
    font-size: 1.125rem;
    line-height: 1.7;
  }
`

const ReadingSettings: React.FC = () => {
  const [scale, setScale] = useState<ReadingScale>("medium")

  useEffect(() => {
    const apply = () => {
      const next = readReadingScale()
      setScale(next)
      document.documentElement.setAttribute("data-reading-scale", next)
    }

    apply()
    window.addEventListener(READING_SCALE_EVENT, apply)
    window.addEventListener("storage", apply)

    return () => {
      window.removeEventListener(READING_SCALE_EVENT, apply)
      window.removeEventListener("storage", apply)
      document.documentElement.removeAttribute("data-reading-scale")
    }
  }, [])

  return (
    <>
      <Global styles={scaleStyles} />
      <StyledWrapper role="group" aria-label="文章字級">
        <span className="label" aria-hidden="true">
          Aa
        </span>
        {READING_SCALES.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={scale === option.value}
            aria-label={`字級${option.label}`}
            onClick={() => {
              setScale(option.value)
              writeReadingScale(option.value)
            }}
          >
            {option.label}
          </button>
        ))}
      </StyledWrapper>
    </>
  )
}

export default ReadingSettings

const StyledWrapper = styled.div`
  display: flex;
  padding: 0.125rem;
  gap: 0.125rem;
  align-items: center;
  border-radius: 9999px;
  background-color: ${({ theme }) => theme.colors.gray4};

  > .label {
    display: flex;
    height: 1.75rem;
    padding: 0 0.375rem;
    align-items: center;
    font-size: 0.75rem;
    line-height: 1;
    color: ${({ theme }) => theme.colors.gray9};
  }

  > button {
    display: flex;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 9999px;
    background: transparent;
    color: ${({ theme }) => theme.colors.gray10};
    font-size: 0.75rem;
    line-height: 1;
    cursor: pointer;

    :hover {
      color: ${({ theme }) => theme.colors.gray12};
    }

    &[aria-pressed="true"] {
      background-color: ${({ theme }) => theme.colors.gray6};
      color: ${({ theme }) => theme.colors.gray12};
      font-weight: 600;
    }
  }
`
