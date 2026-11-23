import styled from "@emotion/styled"
import React, { useEffect, useState } from "react"
import { Emoji } from "src/components/Emoji"
import {
  GUIDE_PROGRESS_EVENT,
  readGuideChecked,
  resetGuideChecked,
} from "src/libs/guideProgress"
import type { GuideTodo } from "./utils"

type Props = {
  todos: GuideTodo[]
}

const GuideProgress: React.FC<Props> = ({ todos }) => {
  const [done, setDone] = useState(
    () => todos.filter((todo) => todo.checked).length
  )

  useEffect(() => {
    const update = () =>
      setDone(
        todos.filter((todo) => readGuideChecked(todo.id, todo.checked)).length
      )

    update()
    window.addEventListener(GUIDE_PROGRESS_EVENT, update)
    window.addEventListener("storage", update)

    return () => {
      window.removeEventListener(GUIDE_PROGRESS_EVENT, update)
      window.removeEventListener("storage", update)
    }
  }, [todos])

  if (todos.length === 0) return null

  const percent = Math.round((done / todos.length) * 100)

  return (
    <StyledWrapper>
      <div className="top">
        <span className="label">
          <Emoji>🎯</Emoji> 攻略進度
        </span>
        <span className="count">
          {done} / {todos.length}
        </span>
      </div>
      <div
        className="bar"
        role="progressbar"
        aria-label="攻略進度"
        aria-valuemin={0}
        aria-valuemax={todos.length}
        aria-valuenow={done}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      {done > 0 && (
        <button
          type="button"
          className="reset"
          onClick={() => resetGuideChecked(todos.map((todo) => todo.id))}
        >
          重設進度
        </button>
      )}
    </StyledWrapper>
  )
}

export default GuideProgress

const StyledWrapper = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.gray6};
  border-radius: 1rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? theme.colors.gray2 : theme.colors.gray3};

  > .top {
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    line-height: 1.25rem;

    > .label {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.gray12};
    }

    > .count {
      color: ${({ theme }) => theme.colors.gray10};
      font-variant-numeric: tabular-nums;
    }
  }

  > .bar {
    overflow: hidden;
    height: 6px;
    margin-top: 0.5rem;
    border-radius: 9999px;
    background-color: ${({ theme }) => theme.colors.gray6};

    > span {
      display: block;
      height: 100%;
      border-radius: 9999px;
      background-color: ${({ theme }) => theme.colors.gray12};
      transition: width 200ms;
    }
  }

  > .reset {
    padding: 0;
    margin-top: 0.5rem;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.gray10};
    font-size: 0.75rem;
    line-height: 1rem;
    text-decoration: underline;
    cursor: pointer;

    :hover {
      color: ${({ theme }) => theme.colors.gray12};
    }
  }
`
