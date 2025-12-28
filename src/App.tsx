import { useRef, useState, type FormEvent } from 'react'
import './App.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  'https://api.placeholder.urlshortener/v1'
const SHORT_DOMAIN =
  import.meta.env.VITE_SHORT_DOMAIN?.trim() || 'https://u.short'
const MAX_HISTORY = 5

type ShortResult = {
  id: string
  longUrl: string
  shortUrl: string
  createdAt: string
}

const isPlaceholderApi = (baseUrl: string) =>
  baseUrl.includes('placeholder') || baseUrl.includes('example')

const normalizeBase = (value: string) =>
  value.endsWith('/') ? value.slice(0, -1) : value

const buildShortUrl = (domain: string, slug: string) =>
  `${normalizeBase(domain)}/${slug}`

const createSlug = () => Math.random().toString(36).slice(2, 8)

const requestShortUrl = async (targetUrl: string): Promise<string> => {
  if (isPlaceholderApi(API_BASE_URL)) {
    await new Promise((resolve) => setTimeout(resolve, 450))
    return buildShortUrl(SHORT_DOMAIN, createSlug())
  }

  const response = await fetch(`${normalizeBase(API_BASE_URL)}/url-shortener`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: targetUrl }),
  })

  let payload: {
    status?: string
    data?: { url?: string; shortcode?: string }
    message?: string
  } | null = null

  try {
    payload = (await response.json()) as typeof payload
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to shorten')
  }

  const shortUrl = payload?.data?.url
  if (shortUrl) {
    return shortUrl
  }

  const shortcode = payload?.data?.shortcode
  if (shortcode) {
    return buildShortUrl(SHORT_DOMAIN, shortcode)
  }

  throw new Error('Missing short URL')
}

function App() {
  const [longUrl, setLongUrl] = useState('')
  const [result, setResult] = useState<ShortResult | null>(null)
  const [history, setHistory] = useState<ShortResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [logoFailed, setLogoFailed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const trimmed = longUrl.trim()
    if (!trimmed) {
      setErrorMessage('Enter a URL to shorten.')
      return
    }

    const withProtocol =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`

    let normalized = ''
    try {
      normalized = new URL(withProtocol).toString()
    } catch {
      setErrorMessage('Enter a valid URL, like https://example.com.')
      return
    }

    setIsLoading(true)
    try {
      const shortUrl = await requestShortUrl(normalized)
      const entry: ShortResult = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        longUrl: normalized,
        shortUrl,
        createdAt: new Date().toISOString(),
      }

      setResult(entry)
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY))
      setLongUrl('')
      inputRef.current?.focus()
    } catch {
      setErrorMessage('Shortening failed. Try again soon.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (entry: ShortResult) => {
    try {
      await navigator.clipboard.writeText(entry.shortUrl)
      setCopiedId(entry.id)
      window.setTimeout(() => setCopiedId(null), 1600)
    } catch {
      setCopiedId(entry.id)
      window.setTimeout(() => setCopiedId(null), 1600)
    }
  }

  const handleReset = () => {
    setResult(null)
    setLongUrl('')
    setErrorMessage('')
    inputRef.current?.focus()
  }

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          {logoFailed ? (
            <div className="brand-mark" role="img" aria-label="URL Shortener">
              <span className="brand-mark__left">URL</span>
              <span className="brand-mark__right">shortener</span>
              <span className="brand-mark__icon" aria-hidden="true">
                <svg viewBox="0 0 48 40">
                  <path d="M12 20h14" />
                  <path d="M22 12l12 8-12 8" />
                  <path d="M12 28a10 10 0 1 1 0-16h6" />
                </svg>
              </span>
            </div>
          ) : (
            <img
              className="brand-logo"
              src="/url-shortener-logo.png"
              alt="URL Shortener logo"
              onError={() => setLogoFailed(true)}
            />
          )}
          <a
            className="brand-kicker"
            href="https://github.com/thecompstudguy"
            target="_blank"
            rel="noreferrer"
          >
            By TheCompSTUDGuy
          </a>
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="eyebrow">Short links. Clean launch.</p>
          <h1 className="hero-title">
            Turn long URLs into <span>bold short links</span>.
          </h1>
        </section>

        <section className="panel">
          <form className="shorten-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="long-url">Long URL</label>
            <div className="input-row">
              <input
                ref={inputRef}
                id="long-url"
                type="url"
                inputMode="url"
                placeholder="https://your-long-link.com/with/params"
                value={longUrl}
                onChange={(event) => {
                  setLongUrl(event.target.value)
                  if (errorMessage) {
                    setErrorMessage('')
                  }
                }}
                autoComplete="off"
                spellCheck="false"
              />
              <button className="primary-button" type="submit" disabled={isLoading}>
                {isLoading ? 'Shortening...' : 'Shorten'}
              </button>
            </div>
            <div className="helper-row">
              <span>Press Enter to shorten another.</span>
            </div>
          </form>

          {errorMessage ? (
            <div className="status status-error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          {result ? (
            <div className="result-card" aria-live="polite">
              <div className="result-top">
                <span>Short URL</span>
              </div>
              <div className="result-link">
                <a href={result.shortUrl} target="_blank" rel="noreferrer">
                  {result.shortUrl}
                </a>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleCopy(result)}
                >
                  {copiedId === result.id ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="result-meta">
                <span className="truncate" title={result.longUrl}>
                  {result.longUrl}
                </span>
                <button type="button" className="text-button" onClick={handleReset}>
                  Shorten another
                </button>
              </div>
            </div>
          ) : (
            <div className="result-placeholder">
              <div className="placeholder-icon" />
              <div>
                <h3>Your short link will land here.</h3>
                <p>Paste a link to see your shortened URL instantly.</p>
              </div>
            </div>
          )}
        </section>

        <section className="hero">
          <p className="lead">
            Paste a long link, get a short one, and share instantly. Built for the
            URL Shortener release, ready for sharing.
          </p>
          <div className="badge-row">
            <span className="badge accent">Instant output</span>
            <span className="badge dark">One-tap copy</span>
            <span className="badge light">Share ready</span>
          </div>
        </section>
      </main>

      <section className="history">
        <div className="history-header">
          <h2>Recent links</h2>
          <p>Revisit your last few shortened URLs without losing focus.</p>
        </div>
        {history.length ? (
          <ul className="history-list">
            {history.map((item) => (
              <li className="history-item" key={item.id}>
                <div className="history-info">
                  <span className="history-short" title={item.longUrl}>
                    {item.shortUrl}
                  </span>
                </div>
                <div className="history-actions">
                  <button
                    className="mini-button"
                    type="button"
                    onClick={() => handleCopy(item)}
                  >
                    {copiedId === item.id ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    className="mini-link"
                    href={item.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="history-empty">
            No links yet. Your latest shortened URLs will appear here.
          </p>
        )}
      </section>

      <footer className="footer">
        <div className="footer-content">
          <span>Built for fast sharing and crisp short links.</span>
          <span>
            Made by{' '}
            <a
              href="https://github.com/thecompstudguy"
              target="_blank"
              rel="noreferrer"
            >
              TheCompSTUDGuy
            </a>
          </span>
        </div>
        <div className="footer-links">
          <a
            href="https://github.com/thecompstudguy/url-shortener-fe"
            target="_blank"
            rel="noreferrer"
            className="github-link"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
