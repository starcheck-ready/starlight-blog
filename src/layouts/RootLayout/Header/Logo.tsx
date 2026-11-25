import styled from "@emotion/styled"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { MdOutlineChevronLeft, MdOutlineHome } from "react-icons/md"
import { CONFIG } from "site.config"

const NAV_FLAG = "starlight:hasNavigated"

const Logo = () => {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    const mark = () => {
      window.sessionStorage.setItem(NAV_FLAG, "1")
      setCanGoBack(true)
    }

    if (window.sessionStorage.getItem(NAV_FLAG) === "1") setCanGoBack(true)

    router.events.on("routeChangeComplete", mark)
    return () => router.events.off("routeChangeComplete", mark)
  }, [router.events])

  if (router.pathname === "/") {
    return (
      <StyledWrapper href="/" aria-label={CONFIG.blog.title}>
        {CONFIG.blog.title}
      </StyledWrapper>
    )
  }

  const handleBack = () => {
    if (canGoBack) router.back()
    else router.push("/")
  }

  return (
    <StyledActions>
      <StyledButton
        type="button"
        onClick={handleBack}
        aria-label="返回"
        title="返回"
      >
        <MdOutlineChevronLeft aria-hidden />
      </StyledButton>
      <StyledButton
        type="button"
        onClick={() => router.push("/")}
        aria-label="首頁"
        title="首頁"
      >
        <MdOutlineHome aria-hidden />
      </StyledButton>
    </StyledActions>
  )
}

export default Logo

const StyledWrapper = styled(Link)``

const StyledActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (max-width: 480px) {
    gap: 0.375rem;
  }
`

const StyledButton = styled.button`
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 9999px;
  background-color: ${({ theme }) => theme.colors.gray4};
  color: ${({ theme }) => theme.colors.gray11};
  font-size: 1.5rem;
  cursor: pointer;

  :hover {
    background-color: ${({ theme }) => theme.colors.gray5};
    color: ${({ theme }) => theme.colors.gray12};
  }

  @media (max-width: 480px) {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.375rem;
  }
`
