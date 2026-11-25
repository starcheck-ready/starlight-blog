import styled from "@emotion/styled"
import React from "react"
import { READING_SCALES, ReadingScale } from "src/libs/readingScale"

type Props = {
  value: ReadingScale
  onChange: (scale: ReadingScale) => void
}

const ReadingSettings: React.FC<Props> = ({ value, onChange }) => {
  return (
    <StyledWrapper role="group" aria-label="文章字級">
      <span className="label" aria-hidden="true">
        Aa
      </span>
      {READING_SCALES.map((scale) => (
        <button
          key={scale.value}
          type="button"
          aria-pressed={value === scale.value}
          aria-label={`字級${scale.label}`}
          onClick={() => onChange(scale.value)}
        >
          {scale.label}
        </button>
      ))}
    </StyledWrapper>
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
