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
import ReadingPosition from "./ReadingPosition"
import HeadingLinks from "./HeadingLinks"
import BookmarkButton from "./BookmarkButton"
import ReadingSettings from "./ReadingSettings"
import TableOfContents from "./TableOfContents"
import PostNavigation from "./PostNavigation"
import RelatedPosts from "./RelatedPosts"
import SeriesNav from "./SeriesNav"
import GuideProgress from "./GuideProgress"
import {
  getAdjacentPosts,
  getGuideTodos,
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
  const guideTodos = useMemo(
    () => (data ? getGuideTodos(data.recordMap, data.id) : []),
    [data]
  )

  if (!data) return null

  const category = (data.category && data.category?.[0]) || undefined
  const isPublicPost = data.status?.[0] === "Public"
  const isOutdated = data.status?.[0] === "Outdated"
  const showToc = toc.length >= 2

  return (
    <>
      <ReadingProgress targetRef={wrapperRef} />
      <ReadingPosition postId={data.id} />
      <HeadingLinks containerRef={wrapperRef} />
      <StyledWrapper ref={wrapperRef}>
        <div className="layout" data-toc={showToc}>
          <article>
            <div className="actions">
              <div>
                {category && (
                  <Category readOnly={data.status?.[0] === "PublicOnDetail"}>
                    {category}
                  </Category>
                )}
              </div>
              <div className="tools">
                <ReadingSettings />
                {data.type[0] === "Post" && <BookmarkButton slug={data.slug} />}
              </div>
            </div>
            {isOutdated && (
              <div className="outdated" role="note">
                <strong>⚠️ 內容已過時</strong>
                <span>
                  這篇的資料已被確認有誤或不再適用，僅保留作為紀錄參考。
                </span>
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
            <GuideProgress todos={guideTodos} />
            <div>
              <NotionRenderer recordMap={data.recordMap} />
            </div>
            {isPublicPost && (
              <>
                <SeriesNav current={data} posts={posts} />
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

    &[data-toc="true"] {
      @media (min-width: 1024px) {
        grid-template-columns: minmax(0, 1fr) 11.5rem;
      }
    }

    > article {
      margin: 0 auto;
      width: 100%;
      max-width: 42rem;
      min-width: 0;

      > .actions {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
        gap: 0.5rem;
        justify-content: space-between;
        align-items: center;

        > .tools {
          display: flex;
          margin-left: auto;
          gap: 0.5rem;
          align-items: center;
        }
      }

      > .outdated {
        display: flex;
        flex-direction: column;
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        gap: 0.25rem;
        border-radius: 0.75rem;
        border: 1px solid ${({ theme }) => theme.colors.gray6};
        background-color: ${({ theme }) => theme.colors.gray4};
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${({ theme }) => theme.colors.gray11};

        strong {
          color: ${({ theme }) => theme.colors.gray12};
        }
      }
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
