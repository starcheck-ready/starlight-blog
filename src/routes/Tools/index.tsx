import styled from "@emotion/styled"
import Link from "next/link"
import { MdOutlineChevronRight } from "react-icons/md"
import { Emoji } from "src/components/Emoji"

const TOOLS = [
  {
    name: "密碼產生器",
    description: "產生隨機、易記或 PIN 密碼，全部在你的瀏覽器完成。",
    href: "/tools/password-generator",
    emoji: "🔐",
  },
]

const Tools: React.FC = () => {
  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>🧰</Emoji> 小工具
        </h1>
        <p>
          一些在瀏覽器就能用的小工具，不需要註冊，也不會把輸入的資料傳到伺服器。
        </p>
      </div>

      <div className="list">
        {TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href} className="tool">
            <span className="tool-emoji">
              <Emoji>{tool.emoji}</Emoji>
            </span>
            <span className="tool-text">
              <span className="tool-name">{tool.name}</span>
              <span className="tool-desc">{tool.description}</span>
            </span>
            <MdOutlineChevronRight className="tool-arrow" aria-hidden />
          </Link>
        ))}
      </div>
    </StyledWrapper>
  )
}

export default Tools

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

    p {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
      color: ${({ theme }) => theme.colors.gray10};
    }
  }

  > .list {
    display: grid;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  a.tool {
    display: flex;
    gap: 0.875rem;
    align-items: center;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.gray6};
    border-radius: 0.75rem;
    color: inherit;
    text-decoration: none;

    :hover {
      background-color: ${({ theme }) => theme.colors.gray3};
    }

    .tool-emoji {
      display: flex;
      width: 2.75rem;
      height: 2.75rem;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      border-radius: 0.75rem;
      background-color: ${({ theme }) => theme.colors.gray3};
      font-size: 1.375rem;
    }

    .tool-text {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .tool-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.gray12};
    }

    .tool-desc {
      font-size: 0.8125rem;
      line-height: 1.5;
      color: ${({ theme }) => theme.colors.gray10};
    }

    .tool-arrow {
      flex-shrink: 0;
      font-size: 1.25rem;
      color: ${({ theme }) => theme.colors.gray9};
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;
  }
`
