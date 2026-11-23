import styled from "@emotion/styled"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"

type TOrder = "asc" | "desc"

type Props = {}

const OrderButtons: React.FC<Props> = () => {
  const router = useRouter()

  const currentOrder = `${router.query.order || ``}` || ("desc" as TOrder)

  const getHref = (order: TOrder) => ({
    pathname: router.pathname,
    query: { ...router.query, order },
  })

  return (
    <StyledWrapper>
      <Link href={getHref("desc")} data-active={currentOrder === "desc"}>
        Desc
      </Link>
      <Link href={getHref("asc")} data-active={currentOrder === "asc"}>
        Asc
      </Link>
    </StyledWrapper>
  )
}

export default OrderButtons

const StyledWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  a {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.gray10};

    &[data-active="true"] {
      font-weight: 700;

      color: ${({ theme }) => theme.colors.gray12};
    }
  }
`
