import styled from "@emotion/styled"
import Link from "next/link"

const NavBar: React.FC = () => {
  const links = [
    { id: 1, name: "About", to: "/about" },
    { id: 2, name: "Archive", to: "/archive" },
  ]
  return (
    <StyledWrapper className="">
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <Link href={link.to}>{link.name}</Link>
          </li>
        ))}
        <li key="rss" className="rss">
          <a href="/rss.xml" target="_blank" rel="noreferrer">
            RSS
          </a>
        </li>
      </ul>
    </StyledWrapper>
  )
}

export default NavBar

const StyledWrapper = styled.div`
  flex-shrink: 0;
  ul {
    display: flex;
    flex-direction: row;
    li {
      display: block;
      margin-left: 1rem;
      color: ${({ theme }) => theme.colors.gray11};

      a:hover {
        color: ${({ theme }) => theme.colors.gray12};
      }
    }

    @media (max-width: 480px) {
      li {
        margin-left: 0.5rem;
      }

      li.rss {
        display: none;
      }
    }
  }
`
