import styled from "@emotion/styled"
import Link from "next/link"
import {
  MdOutlineArchive,
  MdOutlineFolderOpen,
  MdOutlinePersonOutline,
  MdOutlineRssFeed,
} from "react-icons/md"

const links = [
  { id: 1, name: "About", to: "/about", icon: MdOutlinePersonOutline },
  { id: 2, name: "Archive", to: "/archive", icon: MdOutlineArchive },
  { id: 3, name: "Projects", to: "/projects", icon: MdOutlineFolderOpen },
]

const NavBar: React.FC = () => {
  return (
    <StyledWrapper>
      <ul>
        {links.map(({ id, name, to, icon: Icon }) => (
          <li key={id}>
            <Link href={to} aria-label={name} title={name}>
              <Icon aria-hidden />
            </Link>
          </li>
        ))}
        <li key="rss">
          <a
            href="/rss.xml"
            target="_blank"
            rel="noreferrer"
            aria-label="RSS"
            title="RSS"
          >
            <MdOutlineRssFeed aria-hidden />
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

      a {
        display: flex;
        align-items: center;
        font-size: 1.25rem;
      }

      a:hover {
        color: ${({ theme }) => theme.colors.gray12};
      }
    }

    @media (max-width: 480px) {
      li {
        margin-left: 0.75rem;
      }
    }
  }
`
