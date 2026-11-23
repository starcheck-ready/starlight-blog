import styled from "@emotion/styled"
import Image from "next/image"
import Link from "next/link"
import React from "react"
import { CONFIG } from "site.config"
import { Emoji } from "src/components/Emoji"
import Tag from "src/components/Tag"

type Project = {
  name: string
  href: string
  description?: string
  tags?: string[]
  image?: string
}

const Projects: React.FC = () => {
  const projects = (CONFIG.projects ?? []) as Project[]

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>🌟</Emoji> Projects
        </h1>
        <div className="meta">
          <span>{projects.length} 個專案</span>
          <Link href="/">← 返回首頁</Link>
        </div>
      </div>
      {projects.length === 0 && <p className="empty">還沒有專案。</p>}
      <div className="grid">
        {projects.map((project) => (
          <a
            key={project.href}
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="card"
          >
            <div className="thumbnail">
              {project.image ? (
                <Image
                  src={project.image}
                  fill
                  alt={project.name}
                  sizes="(min-width: 768px) 420px, 100vw"
                  css={{ objectFit: "cover" }}
                />
              ) : (
                <span className="placeholder">
                  <Emoji>🧩</Emoji>
                </span>
              )}
            </div>
            <div className="content">
              <h2>{project.name}</h2>
              {project.description && <p>{project.description}</p>}
              {project.tags && project.tags.length > 0 && (
                <div className="tags">
                  {project.tags.map((tag) => (
                    <Tag key={tag} readOnly>
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </StyledWrapper>
  )
}

export default Projects

const StyledWrapper = styled.div`
  padding: 2.5rem;
  margin: 2rem auto;
  border-radius: 1.5rem;
  max-width: 56rem;
  background-color: ${({ theme }) =>
    theme.scheme === "light" ? "white" : theme.colors.gray4};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  > .hero {
    padding-bottom: 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};

    h1 {
      display: flex;
      gap: 0.4rem;
      align-items: center;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 700;
    }

    > .meta {
      display: flex;
      margin-top: 0.5rem;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: ${({ theme }) => theme.colors.gray10};

      a:hover {
        color: ${({ theme }) => theme.colors.gray12};
      }
    }
  }

  > .empty {
    margin-top: 2rem;
    color: ${({ theme }) => theme.colors.gray10};
  }

  > .grid {
    display: grid;
    margin-top: 1.5rem;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;

    > .card {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      border: 1px solid ${({ theme }) => theme.colors.gray6};
      border-radius: 1rem;
      transition: box-shadow 200ms;
      text-decoration: none;

      :hover {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -2px rgba(0, 0, 0, 0.05);
      }
    }

    > .card > .thumbnail {
      position: relative;
      width: 100%;
      padding-bottom: 56%;
      background-color: ${({ theme }) => theme.colors.gray5};

      > .placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
      }
    }

    > .card > .content {
      display: flex;
      padding: 1rem;
      flex-direction: column;
      gap: 0.5rem;

      > h2 {
        font-size: 1.125rem;
        line-height: 1.5rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.gray12};
      }

      > p {
        font-size: 0.875rem;
        line-height: 1.5;
        color: ${({ theme }) => theme.colors.gray11};
      }

      > .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;
  }
`
