import styled from "@emotion/styled"
import React, { RefObject, useEffect, useState } from "react"

type Props = {
  targetRef: RefObject<HTMLElement>
}

const ReadingProgress: React.FC<Props> = ({ targetRef }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const element = targetRef.current
      if (!element) return

      const start = element.getBoundingClientRect().top + window.scrollY
      const total = element.offsetHeight - window.innerHeight

      if (total <= 0) {
        setProgress(0)
        return
      }

      const value = (window.scrollY - start) / total
      setProgress(Math.min(1, Math.max(0, value)))
    }

    const handleScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [targetRef])

  return (
    <StyledBar
      aria-hidden="true"
      style={{ transform: `scaleX(${progress})` }}
    />
  )
}

export default ReadingProgress

const StyledBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${({ theme }) => theme.zIndexes.header + 1};
  width: 100%;
  height: 3px;
  transform-origin: 0 50%;
  background-color: ${({ theme }) => theme.colors.gray12};
  pointer-events: none;
`
