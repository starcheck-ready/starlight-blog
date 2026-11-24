import styled from "@emotion/styled"
import React, { useEffect, useState } from "react"
import { MdBookmark, MdBookmarkBorder } from "react-icons/md"
import {
  BOOKMARK_EVENT,
  isBookmarked,
  toggleBookmark,
} from "src/libs/bookmarks"

type Props = {
  slug: string
}

const BookmarkButton: React.FC<Props> = ({ slug }) => {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const sync = () => setSaved(isBookmarked(slug))

    sync()
    window.addEventListener(BOOKMARK_EVENT, sync)
    window.addEventListener("storage", sync)

    return () => {
      window.removeEventListener(BOOKMARK_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [slug])

  return (
    <StyledButton
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "取消收藏" : "收藏這篇文章"}
      title={saved ? "取消收藏" : "收藏"}
      onClick={() => setSaved(toggleBookmark(slug))}
    >
      {saved ? <MdBookmark aria-hidden /> : <MdBookmarkBorder aria-hidden />}
    </StyledButton>
  )
}

export default BookmarkButton

const StyledButton = styled.button`
  display: flex;
  padding: 0.4rem;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9999px;
  background-color: ${({ theme }) => theme.colors.gray4};
  color: ${({ theme }) => theme.colors.gray10};
  font-size: 1.1rem;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.colors.gray5};
    color: ${({ theme }) => theme.colors.gray12};
  }

  &[aria-pressed="true"] {
    color: ${({ theme }) => theme.colors.gray12};
  }
`
