import styled from "@emotion/styled"
import React, { useEffect, useState } from "react"
import {
  GUIDE_PROGRESS_EVENT,
  readGuideChecked,
  writeGuideChecked,
} from "src/libs/guideProgress"

type Props = {
  isChecked: boolean
  blockId?: string
}

const GuideCheckbox: React.FC<Props> = ({ isChecked, blockId }) => {
  const [checked, setChecked] = useState(() =>
    blockId ? readGuideChecked(blockId, isChecked) : isChecked
  )

  useEffect(() => {
    if (!blockId) return

    const sync = () => setChecked(readGuideChecked(blockId, isChecked))

    window.addEventListener(GUIDE_PROGRESS_EVENT, sync)
    window.addEventListener("storage", sync)

    return () => {
      window.removeEventListener(GUIDE_PROGRESS_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [blockId, isChecked])

  const handleToggle = () => {
    if (!blockId) return

    const next = !checked
    setChecked(next)
    writeGuideChecked(blockId, next)
  }

  return (
    <StyledCheckbox
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? "標記為未完成" : "標記為完成"}
      className="notion-property notion-property-checkbox"
      onClick={handleToggle}
    >
      {checked ? (
        <div className="notion-property-checkbox-checked">
          <svg viewBox="0 0 14 14">
            <path d="M5.5 12L14 3.5 12.5 2l-7 7-4-4.003L0 6.499z" />
          </svg>
        </div>
      ) : (
        <div className="notion-property-checkbox-unchecked" />
      )}
    </StyledCheckbox>
  )
}

export default GuideCheckbox

const StyledCheckbox = styled.button`
  display: inline-flex;
  padding: 0;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  flex-shrink: 0;
  cursor: pointer;

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.gray12};
    outline-offset: 2px;
  }
`
