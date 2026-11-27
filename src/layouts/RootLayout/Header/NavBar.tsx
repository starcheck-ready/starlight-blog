import styled from "@emotion/styled"
import Link from "next/link"
import {
  MdOutlineArchive,
  MdOutlineBookmarkBorder,
  MdOutlineFolderOpen,
  MdOutlinePersonOutline,
  MdOutlineSettings,
} from "react-icons/md"

const links = [
  { id: 1, name: "About", to: "/about", icon: MdOutlinePersonOutline },
  { id: 2, name: "Archive", to: "/archive", icon: MdOutlineArchive },
  { id: 3, name: "Projects", to: "/projects", icon: MdOutlineFolderOpen },
  { id: 4, name: "Saved", to: "/saved", icon: MdOutlineBookmarkBorder },
  { id: 5, name: "設定", to: "/settings", icon: MdOutlineSettings },
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
    align-items: center;
    padding: 0;
    margin: 0;
    list-style: none;
    li {
      display: block;
      color: ${({ theme }) => theme.colors.gray11};

      a {
        display: flex;
        width: 2.125rem;
        height: 2.125rem;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        font-size: 1.2rem;
      }

      a:hover {
        background-color: ${({ theme }) => theme.colors.gray5};
        color: ${({ theme }) => theme.colors.gray12};
      }
    }

    @media (max-width: 480px) {
      li a {
        width: 2rem;
        height: 2rem;
      }
    }
  }
`
