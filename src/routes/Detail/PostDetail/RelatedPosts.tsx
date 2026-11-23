import styled from "@emotion/styled"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { Emoji } from "src/components/Emoji"
import type { TPosts } from "src/types"

type Props = {
  posts: TPosts
}

const RelatedPosts: React.FC<Props> = ({ posts }) => {
  if (posts.length === 0) return null

  return (
    <StyledWrapper>
      <div className="title">
        <Emoji>📚</Emoji> 相關文章
      </div>
      <div className="grid">
        {posts.map((post) => (
          <Link key={post.id} href={`/${post.slug}`} className="card">
            <div className="thumbnail">
              {post.thumbnail ? (
                <Image
                  src={post.thumbnail}
                  fill
                  alt={post.title}
                  sizes="(min-width: 768px) 200px, 45vw"
                  css={{ objectFit: "cover" }}
                />
              ) : (
                <span className="placeholder">
                  <Emoji>📝</Emoji>
                </span>
              )}
            </div>
            <h3>{post.title}</h3>
          </Link>
        ))}
      </div>
    </StyledWrapper>
  )
}

export default RelatedPosts

const StyledWrapper = styled.div`
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray6};

  > .title {
    display: flex;
    margin-bottom: 1rem;
    gap: 0.35rem;
    align-items: center;
    font-size: 1.0625rem;
    line-height: 1.5rem;
    font-weight: 700;
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  > .grid > .card {
    display: flex;
    flex-direction: column;
    min-width: 0;

    > .thumbnail {
      position: relative;
      overflow: hidden;
      width: 100%;
      padding-bottom: 62%;
      margin-bottom: 0.625rem;
      border: 1px solid ${({ theme }) => theme.colors.gray6};
      border-radius: 0.75rem;
      background-color: ${({ theme }) => theme.colors.gray4};
    }

    > .thumbnail > .placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    > h3 {
      display: -webkit-box;
      overflow: hidden;
      font-size: 0.875rem;
      line-height: 1.4;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.gray12};
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    :hover > h3 {
      text-decoration: underline;
    }
  }
`
