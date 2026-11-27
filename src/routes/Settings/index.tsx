import styled from "@emotion/styled"
import { useState } from "react"
import {
  MdOutlineDarkMode,
  MdOutlineDeleteSweep,
  MdOutlineLightMode,
  MdOutlineRssFeed,
} from "react-icons/md"
import { Emoji } from "src/components/Emoji"
import useScheme from "src/hooks/useScheme"
import { SchemeType } from "src/types"

const CLEAR_TARGETS = [
  "Cookies",
  "Hash 快取（Cache Storage）",
  "LocalStorage",
  "SessionStorage",
]

/** 盡量把目前網域與上層網域的可讀 cookie 都刪掉（httpOnly 的除外） */
const clearCookies = () => {
  const host = window.location.hostname
  const domains = new Set<string>([""])

  // IP 或 localhost 沒有上層網域，只有裸主機本身
  if (host && !/^[\d.]+$/.test(host)) {
    const parts = host.split(".")
    for (let i = 0; i < parts.length - 1; i++) {
      const domain = parts.slice(i).join(".")
      domains.add(domain)
      domains.add(`.${domain}`)
    }
  }

  const paths = ["/", window.location.pathname]
  const names = document.cookie
    .split(";")
    .map((entry) => entry.split("=")[0]?.trim())
    .filter((name): name is string => !!name)

  names.forEach((name) => {
    paths.forEach((path) => {
      domains.forEach((domain) => {
        const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = `${name}=; ${expires}; path=${path}`
        if (domain) {
          document.cookie = `${name}=; ${expires}; path=${path}; domain=${domain}`
        }
      })
    })
  })
}

const clearCaches = async () => {
  if (typeof caches === "undefined") return
  try {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  } catch {
    // 瀏覽器不支援或被封鎖時略過
  }
}

const Settings: React.FC = () => {
  const [scheme, setScheme] = useScheme()
  const [confirming, setConfirming] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleClear = async () => {
    setClearing(true)

    try {
      window.localStorage.clear()
    } catch {
      // 私密模式可能封鎖 localStorage
    }
    try {
      window.sessionStorage.clear()
    } catch {
      // 同上
    }

    clearCookies()
    await clearCaches()

    window.setTimeout(() => window.location.reload(), 600)
  }

  const renderSchemeButton = (value: SchemeType, label: string, icon: JSX.Element) => (
    <button
      type="button"
      className="scheme"
      data-active={scheme === value}
      aria-pressed={scheme === value}
      onClick={() => setScheme(value)}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>⚙️</Emoji> 設定
        </h1>
        <p>調整網站外觀、訂閱文章，或清除這台裝置上的網站資料。</p>
      </div>

      <section className="card">
        <div className="card-head">
          <h2>外觀</h2>
          <p>選擇淺色或深色模式，偏好會存在這台裝置的 cookie。</p>
        </div>
        <div className="scheme-group">
          {renderSchemeButton("light", "淺色", <MdOutlineLightMode aria-hidden />)}
          {renderSchemeButton("dark", "深色", <MdOutlineDarkMode aria-hidden />)}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>訂閱</h2>
          <p>用 RSS 閱讀器訂閱本站，新文章會自動推送。</p>
        </div>
        <a
          className="action"
          href="/rss.xml"
          target="_blank"
          rel="noreferrer"
        >
          <MdOutlineRssFeed aria-hidden />
          開啟 RSS
        </a>
      </section>

      <section className="card">
        <div className="card-head">
          <h2>清除網站資料</h2>
          <p>
            一鍵清除這台裝置上本站的 {CLEAR_TARGETS.join("、")}
            。清除後主題偏好、收藏文章、閱讀設定與攻略進度都會重設，且無法復原。
          </p>
        </div>

        {confirming ? (
          <div className="confirm">
            <p>確定要清除嗎？</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="ghost"
                disabled={clearing}
                onClick={() => setConfirming(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="danger"
                disabled={clearing}
                onClick={handleClear}
              >
                <MdOutlineDeleteSweep aria-hidden />
                {clearing ? "清除中…" : "確認清除"}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="action danger"
            onClick={() => setConfirming(true)}
          >
            <MdOutlineDeleteSweep aria-hidden />
            清除網站資料
          </button>
        )}
      </section>
    </StyledWrapper>
  )
}

export default Settings

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

  > .card {
    padding-top: 1.5rem;

    & + .card {
      margin-top: 1.5rem;
      border-top: 1px solid ${({ theme }) => theme.colors.gray6};
    }

    > .card-head {
      h2 {
        font-size: 1rem;
        line-height: 1.5rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.gray12};
      }

      p {
        margin-top: 0.375rem;
        font-size: 0.875rem;
        line-height: 1.6;
        color: ${({ theme }) => theme.colors.gray10};
      }
    }
  }

  .scheme-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  button.scheme,
  a.action,
  button.action {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    justify-content: center;
    height: 2.25rem;
    padding: 0 0.9rem;
    border: 1px solid ${({ theme }) => theme.colors.gray6};
    border-radius: 0.6rem;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.gray11};
    font-size: 0.875rem;
    cursor: pointer;

    svg {
      font-size: 1.1rem;
    }

    :hover {
      background-color: ${({ theme }) => theme.colors.gray5};
      color: ${({ theme }) => theme.colors.gray12};
    }

    &[data-active="true"] {
      border-color: ${({ theme }) => theme.colors.gray8};
      background-color: ${({ theme }) => theme.colors.gray5};
      color: ${({ theme }) => theme.colors.gray12};
      font-weight: 600;
    }
  }

  a.action {
    margin-top: 1rem;
    text-decoration: none;
  }

  button.action {
    margin-top: 1rem;
  }

  .danger {
    border-color: ${({ theme }) => theme.colors.red7};
    color: ${({ theme }) => theme.colors.red11};

    :hover {
      background-color: ${({ theme }) => theme.colors.red3};
      color: ${({ theme }) => theme.colors.red11};
    }

    :disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  > .card > .confirm {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.red6};
    border-radius: 0.75rem;
    background-color: ${({ theme }) => theme.colors.red2};

    p {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.red11};
    }

    .confirm-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .confirm-actions button {
      margin-top: 0;
    }
  }

  button.ghost {
    display: inline-flex;
    align-items: center;
    height: 2.25rem;
    padding: 0 0.9rem;
    border: 1px solid ${({ theme }) => theme.colors.gray6};
    border-radius: 0.6rem;
    background-color: transparent;
    color: ${({ theme }) => theme.colors.gray11};
    font-size: 0.875rem;
    cursor: pointer;

    :hover {
      background-color: ${({ theme }) => theme.colors.gray5};
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;
  }
`
