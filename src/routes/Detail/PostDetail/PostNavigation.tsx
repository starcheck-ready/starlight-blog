import styled from "@emotion/styled"
import Link from "next/link"
import React from "react"
import { CONFIG } from "site.config"
import { formatDate } from "src/libs/utils"
import type { TPost } from "src/types"

type Props = {
  newer?: TPost
  older?: TPost
}

const PostNavigation: React.FC<Props> = ({ newer, older }) => {
  if (!newer && !older) return null

  return (
    <StyledWrapper>
      {older && (
        <Link href={`/${older.slug}`} className="card">
          <span className="label">← 上一篇</span>
          <span className="title">{older.title}</span>
          <span className="date">
            {formatDate(
              older.date?.start_date || older.createdTime,
              CONFIG.lang
            )}
          </span>
        </Link>
      )}
      {newer && (
        <Link href={`/${newer.slug}`} className="card align-right">
          <span className="label">下一篇 →</span>
          <span className="title">{newer.title}</span>
          <span className="date">
            {formatDate(
              newer.date?.start_date || newer.createdTime,
              CONFIG.lang
            )}
          </span>
        </Link>
      )}
    </StyledWrapper>
  )
}

export default PostNavigation

const StyledWrapper = styled.div`
  display: flex;
  margin-top: 2.5rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  > .card {
    display: flex;
    padding: 1rem;
    flex: 1;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
    border: 1px solid ${({ theme }) => theme.colors.gray6};
    border-radius: 1rem;
    transition: background-color 200ms;

    :hover {
      background-color: ${({ theme }) => theme.colors.gray4};
    }

    > .label {
      font-size: 0.75rem;
      line-height: 1rem;
      color: ${({ theme }) => theme.colors.gray10};
    }

    > .title {
      display: -webkit-box;
      overflow: hidden;
      font-size: 0.9375rem;
      line-height: 1.4;
      font-weight: 500;
      color: ${({ theme }) => theme.colors.gray12};
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    > .date {
      font-size: 0.75rem;
      line-height: 1rem;
      color: ${({ theme }) => theme.colors.gray9};
    }

    &.align-right {
      align-items: flex-end;
      text-align: right;
    }
  }
`
