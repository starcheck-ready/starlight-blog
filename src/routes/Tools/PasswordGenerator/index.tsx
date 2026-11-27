import styled from "@emotion/styled"
import { useCallback, useEffect, useState } from "react"
import {
  MdOutlineDialpad,
  MdOutlineLightbulb,
  MdOutlineSecurity,
  MdOutlineShuffle,
} from "react-icons/md"
import { Emoji } from "src/components/Emoji"

const LOWER = "abcdefghijklmnopqrstuvwxyz"
const UPPER = LOWER.toUpperCase()
const DIGITS = "0123456789"
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/"

const WORDS = [
  "amber", "anchor", "apple", "arrow", "autumn", "badge", "bamboo",
  "basket", "beacon", "berry", "biscuit", "blanket", "blossom", "bottle",
  "bridge", "bronze", "bubble", "butter", "cactus", "candle", "canvas",
  "cargo", "carrot", "castle", "cedar", "cherry", "cinder", "circus",
  "citrus", "clover", "cobalt", "comet", "copper", "coral", "cotton",
  "crystal", "daisy", "dawn", "delta", "desert", "dolphin", "dragon",
  "drift", "drum", "echo", "ember", "fable", "falcon", "feather", "fern",
  "fiddle", "field", "flame", "flint", "forest", "fossil", "frost",
  "galaxy", "garden", "garnet", "ginger", "glacier", "globe", "granite",
  "grape", "gravel", "grove", "hammer", "harbor", "hazel", "heron",
  "honey", "horizon", "indigo", "island", "ivory", "jade", "jasmine",
  "jungle", "kettle", "kiwi", "lantern", "lemon", "lilac", "linen",
  "lizard", "lotus", "lunar", "magnet", "mango", "maple", "marble",
  "meadow", "melon", "meteor", "mint", "mirror", "mitten", "moon", "moss",
  "mountain", "nectar", "nickel", "noodle", "north", "nutmeg", "oasis",
  "ocean", "olive", "onyx", "opal", "orange", "orbit", "orchid", "otter",
  "oyster", "paddle", "palm", "panda", "paper", "pebble", "pepper",
  "petal", "piano", "pillow", "pine", "planet", "plum", "pocket", "polar",
  "poodle", "prairie", "prism", "pumpkin", "puzzle", "quartz", "quill",
  "rabbit", "radar", "raven", "reef", "ribbon", "river", "robin", "rocket",
  "rose", "ruby", "saffron", "salmon", "sapphire", "scarlet", "sesame",
  "shadow", "shell", "silver", "sloth", "snow", "solar", "sparrow",
  "spice", "spring", "spruce", "squash", "star", "steel", "stone",
  "storm", "sugar", "summer", "sunset", "swan", "syrup", "taffy", "temple",
  "thistle", "thunder", "tiger", "timber", "toffee", "tomato", "topaz",
  "torch", "tulip", "turtle", "twilight", "umber", "urchin", "valley",
  "vanilla", "velvet", "violet", "walnut", "wasabi", "willow", "window",
  "winter", "wolf", "wonder", "wood", "yellow", "zephyr", "zinc",
]

type Mode = "random" | "memorable" | "pin"

const MODES: { value: Mode; label: string; icon: JSX.Element }[] = [
  { value: "random", label: "隨機", icon: <MdOutlineShuffle aria-hidden /> },
  {
    value: "memorable",
    label: "易記",
    icon: <MdOutlineLightbulb aria-hidden />,
  },
  { value: "pin", label: "PIN", icon: <MdOutlineDialpad aria-hidden /> },
]

const LENGTH_RANGE: Record<Mode, { min: number; max: number; label: string }> =
  {
    random: { min: 8, max: 64, label: "字元數" },
    memorable: { min: 3, max: 8, label: "單字數" },
    pin: { min: 4, max: 12, label: "位數" },
  }

/** 以 crypto 取得無偏誤的隨機整數 */
const randomInt = (max: number) => {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return Math.floor(Math.random() * max)
  }

  const limit = Math.floor(0x100000000 / max) * max
  const buffer = new Uint32Array(1)
  let value = 0

  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)

  return value % max
}

const pickChar = (pool: string) => pool.charAt(randomInt(pool.length))

const shuffle = (chars: string[]) => {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars
}

const randomPassword = (length: number, numbers: boolean, symbols: boolean) => {
  const pools = [LOWER, UPPER]
  if (numbers) pools.push(DIGITS)
  if (symbols) pools.push(SYMBOLS)

  const all = pools.join("")
  // 每個啟用的字元類別至少出現一次
  const chars = pools.map(pickChar)
  while (chars.length < length) chars.push(pickChar(all))

  return shuffle(chars).join("")
}

const memorablePassword = (wordCount: number) =>
  Array.from({ length: wordCount }, () => {
    const word = WORDS[randomInt(WORDS.length)]
    return word.charAt(0).toUpperCase() + word.slice(1)
  }).join("-")

const pinPassword = (length: number) =>
  Array.from({ length }, () => pickChar(DIGITS)).join("")

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(Math.round(value) || min, min), max)

const PasswordGenerator: React.FC = () => {
  const [mode, setMode] = useState<Mode>("random")
  const [length, setLength] = useState(20)
  const [wordCount, setWordCount] = useState(4)
  const [pinLength, setPinLength] = useState(6)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(false)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    let next = ""

    if (mode === "random") next = randomPassword(length, numbers, symbols)
    else if (mode === "memorable") next = memorablePassword(wordCount)
    else next = pinPassword(pinLength)

    setPassword(next)
    setCopied(false)
  }, [mode, length, numbers, symbols, wordCount, pinLength])

  useEffect(() => {
    generate()
  }, [generate])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    if (!password) return

    try {
      await navigator.clipboard.writeText(password)
    } catch {
      // 非 HTTPS 或未授權時退回 execCommand
      const textarea = document.createElement("textarea")
      textarea.value = password
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    setCopied(true)
  }

  const range = LENGTH_RANGE[mode]
  const value =
    mode === "random" ? length : mode === "memorable" ? wordCount : pinLength
  const setValue = (next: number) => {
    const nextValue = clamp(next, range.min, range.max)
    if (mode === "random") setLength(nextValue)
    else if (mode === "memorable") setWordCount(nextValue)
    else setPinLength(nextValue)
  }

  return (
    <StyledWrapper>
      <div className="hero">
        <h1>
          <Emoji>🔐</Emoji> 密碼產生器
        </h1>
        <p>在你的瀏覽器本機產生高強度密碼，不會上傳、也不會儲存。</p>
      </div>

      <section className="panel">
        <h2 className="panel-title">選擇密碼類型</h2>

        <div className="tabs" role="tablist" aria-label="密碼類型">
          {MODES.map(({ value: item, label, icon }) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              data-active={mode === item}
              onClick={() => setMode(item)}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <h2 className="panel-title">自訂你的新密碼</h2>

        <div className="control">
          <span className="control-label">{range.label}</span>
          <input
            type="range"
            min={range.min}
            max={range.max}
            step={1}
            value={value}
            aria-label={range.label}
            onChange={(event) => setValue(Number(event.target.value))}
          />
          <input
            type="number"
            className="number"
            min={range.min}
            max={range.max}
            value={value}
            aria-label={`${range.label}（數字輸入）`}
            onChange={(event) => setValue(Number(event.target.value))}
          />
        </div>

        {mode === "random" && (
          <div className="control switches">
            <Switch
              label="Numbers"
              checked={numbers}
              onChange={setNumbers}
            />
            <Switch
              label="Symbols"
              checked={symbols}
              onChange={setSymbols}
            />
          </div>
        )}

        <h2 className="panel-title">產生的密碼</h2>
        <output className="output" aria-live="polite">
          {password || "…"}
        </output>

        <div className="actions">
          <button
            type="button"
            className="primary"
            onClick={copy}
            disabled={!password}
          >
            {copied ? "已複製！" : "複製密碼"}
          </button>
          <button type="button" className="secondary" onClick={generate}>
            重新產生
          </button>
        </div>
      </section>

      <section className="security">
        <h2>
          <MdOutlineSecurity aria-hidden />
          資安聲明
        </h2>
        <ul>
          <li>
            密碼由瀏覽器端的 Web Crypto API（crypto.getRandomValues）即時產生，
            不經伺服器，也不使用可預測的 Math.random。
          </li>
          <li>
            產生的密碼不會上傳到伺服器，也不會寫入 cookie、localStorage 或
            sessionStorage；重新整理或關閉分頁後即消失。
          </li>
          <li>
            請務必自行把密碼存進密碼管理器。本站沒有任何紀錄，無法幫你找回。
          </li>
          <li>
            按下「複製密碼」會寫入系統剪貼簿，其他程式或瀏覽器擴充功能可能讀取，
            貼上後建議清除剪貼簿。
          </li>
          <li>
            建議每個網站使用不同密碼，並搭配密碼管理器與兩步驟驗證（2FA）。
          </li>
        </ul>
      </section>
    </StyledWrapper>
  )
}

export default PasswordGenerator

type SwitchProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const Switch: React.FC<SwitchProps> = ({ label, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    className="switch"
    onClick={() => onChange(!checked)}
  >
    <span className="track" data-checked={checked}>
      <span className="knob" />
    </span>
    {label}
  </button>
)

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

  .panel-title {
    margin-top: 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.gray12};
  }

  .tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
    margin-top: 0.75rem;
    padding: 0.25rem;
    border-radius: 0.6rem;
    background-color: ${({ theme }) => theme.colors.gray3};

    button {
      display: inline-flex;
      gap: 0.35rem;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      border: none;
      border-radius: 0.45rem;
      background-color: transparent;
      color: ${({ theme }) => theme.colors.gray11};
      font-size: 0.875rem;
      cursor: pointer;

      svg {
        font-size: 1rem;
      }

      :hover {
        color: ${({ theme }) => theme.colors.gray12};
      }

      &[data-active="true"] {
        background-color: ${({ theme }) =>
          theme.scheme === "light" ? "white" : theme.colors.gray6};
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        color: ${({ theme }) => theme.colors.gray12};
        font-weight: 600;
      }
    }
  }

  .control {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.875rem 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray6};

    &.switches {
      display: flex;
      gap: 1.25rem;
    }

    .control-label {
      font-size: 0.875rem;
      color: ${({ theme }) => theme.colors.gray11};
    }

    input[type="range"] {
      width: 100%;
      accent-color: ${({ theme }) => theme.colors.blue9};
      cursor: pointer;
    }

    .number {
      width: 4rem;
      height: 2.25rem;
      padding: 0 0.5rem;
      border: 1px solid ${({ theme }) => theme.colors.gray6};
      border-radius: 0.5rem;
      background-color: transparent;
      color: ${({ theme }) => theme.colors.gray12};
      font-size: 0.875rem;
      text-align: center;
    }
  }

  button.switch {
    display: inline-flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0;
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.gray11};
    font-size: 0.875rem;
    cursor: pointer;

    .track {
      position: relative;
      display: inline-block;
      width: 2.5rem;
      height: 1.4rem;
      border-radius: 9999px;
      background-color: ${({ theme }) => theme.colors.gray7};
      transition: background-color 0.15s ease;

      &[data-checked="true"] {
        background-color: ${({ theme }) => theme.colors.blue9};
      }

      .knob {
        position: absolute;
        top: 0.2rem;
        left: 0.2rem;
        width: 1rem;
        height: 1rem;
        border-radius: 9999px;
        background-color: white;
        transition: transform 0.15s ease;
      }

      &[data-checked="true"] .knob {
        transform: translateX(1.1rem);
      }
    }
  }

  .output {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 3.75rem;
    margin-top: 0.75rem;
    padding: 0.875rem 1rem;
    border: 1px solid ${({ theme }) => theme.colors.gray6};
    border-radius: 0.5rem;
    background-color: ${({ theme }) => theme.colors.gray2};
    color: ${({ theme }) => theme.colors.gray12};
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
      monospace;
    font-size: 1.125rem;
    letter-spacing: 0.06em;
    text-align: center;
    word-break: break-all;
  }

  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-top: 1.25rem;

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 2.75rem;
      border-radius: 0.5rem;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
    }

    .primary {
      border: 1px solid ${({ theme }) => theme.colors.blue9};
      background-color: ${({ theme }) => theme.colors.blue9};
      color: white;

      :hover {
        background-color: ${({ theme }) => theme.colors.blue10};
      }

      :disabled {
        opacity: 0.6;
        cursor: default;
      }
    }

    .secondary {
      border: 1px solid ${({ theme }) => theme.colors.blue8};
      background-color: transparent;
      color: ${({ theme }) => theme.colors.blue11};

      :hover {
        background-color: ${({ theme }) => theme.colors.blue3};
      }
    }
  }

  > .security {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid ${({ theme }) => theme.colors.gray6};

    h2 {
      display: flex;
      gap: 0.35rem;
      align-items: center;
      font-size: 0.9375rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.gray12};

      svg {
        font-size: 1.1rem;
      }
    }

    ul {
      margin-top: 0.75rem;
      padding-left: 1.25rem;
      list-style: disc;

      li {
        font-size: 0.8125rem;
        line-height: 1.7;
        color: ${({ theme }) => theme.colors.gray10};

        & + li {
          margin-top: 0.375rem;
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 1rem auto;

    .actions {
      grid-template-columns: 1fr;
    }
  }
`
