import React, { useMemo, useRef } from "react"
import PostHeader from "./PostHeader"
import Footer from "./PostFooter"
import CommentBox from "./CommentBox"
import Category from "src/components/Category"
import styled from "@emotion/styled"
import NotionRenderer from "../components/NotionRenderer"
import usePostQuery from "src/hooks/usePostQuery"
import usePostsQuery from "src/hooks/usePostsQuery"
import ReadingProgress from "./ReadingProgress"
import TableOfContents from "./TableOfContents"
import PostNavigation from "./PostNavigation"
import RelatedPosts from "./RelatedPosts"
import {
  getAdjacentPosts,
  getReadingTime,
  getRelatedPosts,
  getTableOfContents,
} from "./utils"

type Props = {}

const PostDetail: React.FC<Props> = () => {
  const data = usePostQuery()
  const posts = usePostsQuery()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const toc = useMemo(
    () => (data ? getTableOfContents(data.recordMap, data.id) : []),
    [data]
  )
  const readingTime = useMemo(
    () => (data ? getReadingTime(data.recordMap, data.id) : 0),
    [data]
  )
  const { newer, older } = useMemo(
    () =>
      data
        ? getAdjacentPosts(posts, data)
        : { newer: undefined, older: undefined },
    [posts, data]
  )
  const relatedPosts = useMemo(
    () => (data ? getRelatedPosts(posts, data) : []),
    [posts, data]
  )

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined
  const isPublicPost = data.status?.[0] === "Public"
  const showToc = toc.length >= 2

  return (
    <>
      <ReadingProgress targetRef={wrapperRef} />
      <StyledWrapper ref={wrapperRef}>
        <div className="layout">
          <article>
            {category && (
              <div css={{ marginBottom: "0.5rem" }}>
                <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
                  {category}
                </Category>
              </div>
            )}
            {data.type[0] === "Post" && (
              <PostHeader data={data} readingTime={readingTime} />
            )}
            {showToc && (
              <div className="mobile-toc">
                <TableOfContents entries={toc} mobile />
              </div>
            )}
            <div>
              <NotionRenderer recordMap={data.recordMap} />
            </div>
            {isPublicPost && (
              <>
                <PostNavigation newer={newer} older={older} />
                <RelatedPosts posts={relatedPosts} />
              </>
            )}
            {data.type[0] === "Post" && (
              <>
                <Footer />
                <CommentBox data={data} />
              </>
            )}
          </article>
          {showToc && (
            <aside className="toc">
              <TableOfContents entries={toc} />
            </aside>
          )}
        </div>
      </StyledWrapper>
    </>
  )
}

export default PostDetail

const StyledWrapper = styled.div`
  padding: 3rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 56rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;

  > .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 2rem;

    @media (min-width: 1024px) {
      grid-template-columns: minmax(0, 1fr) 11.5rem;
    }

    > article {
      margin: 0 auto;
      width: 100%;
      max-width: 42rem;
      min-width: 0;
    }

    > .toc {
      display: none;

      @media (min-width: 1024px) {
        display: block;
      }
    }
  }

  .mobile-toc {
    @media (min-width: 1024px) {
      display: none;
    }
  }
`
