import { useRef, useState, useEffect, type FormEvent } from 'react'
import './App.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  'https://api.placeholder.urlshortener/v1'
const SHORT_DOMAIN =
  import.meta.env.VITE_SHORT_DOMAIN?.trim() || 'https://u.short'

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

interface ApiResponse {
  status?: string
  data?: { url?: string; shortcode?: string; originalUrl?: string }
  message?: string
  _meta?: Record<string, unknown>
}

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

  let payload: ApiResponse | null = null

  try {
    payload = (await response.json()) as ApiResponse
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

type CodeLanguage = 'bash' | 'javascript' | 'php' | 'json'

type CodeTokenType =
  | 'text'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'function'
  | 'property'
  | 'variable'
  | 'operator'
  | 'punctuation'

type CodeToken = { type: CodeTokenType; value: string }

const JS_KEYWORDS = new Set([
  'async',
  'await',
  'catch',
  'const',
  'else',
  'false',
  'finally',
  'function',
  'if',
  'let',
  'new',
  'null',
  'return',
  'throw',
  'true',
  'try',
  'var',
])

const PHP_KEYWORDS = new Set([
  'catch',
  'echo',
  'else',
  'false',
  'finally',
  'function',
  'if',
  'new',
  'null',
  'return',
  'throw',
  'true',
  'try',
])

const CURL_KEYWORDS = new Set(['curl', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

const isDigit = (char: string) => char >= '0' && char <= '9'
const isAlpha = (char: string) =>
  (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')
const isIdentifierStart = (char: string) => isAlpha(char) || char === '_' || char === '$'
const isIdentifierPart = (char: string) =>
  isIdentifierStart(char) || isDigit(char)

const tokenizeCode = (code: string, language: CodeLanguage): CodeToken[] => {
  const tokens: CodeToken[] = []
  const push = (type: CodeTokenType, value: string) => {
    if (!value) return
    const last = tokens[tokens.length - 1]
    if (last?.type === type) {
      last.value += value
      return
    }
    tokens.push({ type, value })
  }

  const punctuationChars = new Set(['{', '}', '[', ']', '(', ')', ',', '.', ':', ';'])
  const operatorChars = new Set(['=', '+', '-', '*', '/', '!', '?', '<', '>', '|', '&', '\\'])
  const twoCharOperators = new Set(['=>', '==', '!=', '&&', '||', '??'])

  const peekNonWhitespace = (start: number) => {
    for (let index = start; index < code.length; index += 1) {
      const char = code[index]
      if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') {
        return { char, index }
      }
    }
    return null
  }

  let index = 0
  while (index < code.length) {
    const char = code[index]

    const isLineCommentStart =
      (language === 'javascript' || language === 'php') &&
      char === '/' &&
      code[index + 1] === '/'
    const isBlockCommentStart =
      (language === 'javascript' || language === 'php') &&
      char === '/' &&
      code[index + 1] === '*'

    if (language === 'bash' && char === '#') {
      const lineEnd = code.indexOf('\n', index)
      const end = lineEnd === -1 ? code.length : lineEnd
      push('comment', code.slice(index, end))
      index = end
      continue
    }

    if (isLineCommentStart) {
      const lineEnd = code.indexOf('\n', index)
      const end = lineEnd === -1 ? code.length : lineEnd
      push('comment', code.slice(index, end))
      index = end
      continue
    }

    if (isBlockCommentStart) {
      const endIndex = code.indexOf('*/', index + 2)
      const end = endIndex === -1 ? code.length : endIndex + 2
      push('comment', code.slice(index, end))
      index = end
      continue
    }

    const stringDelimiter =
      char === '"' || char === "'" || (language === 'javascript' && char === '`')
    if (stringDelimiter) {
      const delimiter = char
      let end = index + 1
      while (end < code.length) {
        const current = code[end]
        if (current === '\\') {
          end += 2
          continue
        }
        if (current === delimiter) {
          end += 1
          break
        }
        end += 1
      }
      const raw = code.slice(index, end)
      if (language === 'json' && delimiter === '"') {
        const next = peekNonWhitespace(end)
        push(next?.char === ':' ? 'property' : 'string', raw)
      } else {
        push('string', raw)
      }
      index = end
      continue
    }

    if (language === 'bash' && char === '-' && code[index + 1] && code[index + 1] !== ' ') {
      let end = index + 1
      while (end < code.length) {
        const current = code[end]
        if (current === ' ' || current === '\t' || current === '\n' || current === '\r') {
          break
        }
        end += 1
      }
      push('keyword', code.slice(index, end))
      index = end
      continue
    }

    if (isDigit(char)) {
      let end = index + 1
      while (end < code.length) {
        const current = code[end]
        if (!isDigit(current) && current !== '.') {
          break
        }
        end += 1
      }
      push('number', code.slice(index, end))
      index = end
      continue
    }

    if (char === '$' && language === 'php') {
      let end = index + 1
      while (end < code.length && isIdentifierPart(code[end])) {
        end += 1
      }
      push('variable', code.slice(index, end))
      index = end
      continue
    }

    if (isIdentifierStart(char)) {
      let end = index + 1
      while (end < code.length && isIdentifierPart(code[end])) {
        end += 1
      }

      const word = code.slice(index, end)
      const next = peekNonWhitespace(end)

      if (language === 'bash' && CURL_KEYWORDS.has(word)) {
        push('keyword', word)
        index = end
        continue
      }

      if (language === 'javascript' && JS_KEYWORDS.has(word)) {
        push('keyword', word)
        index = end
        continue
      }

      if (language === 'php' && PHP_KEYWORDS.has(word)) {
        push('keyword', word)
        index = end
        continue
      }

      if (next?.char === '(') {
        push('function', word)
        index = end
        continue
      }

      push('text', word)
      index = end
      continue
    }

    if (punctuationChars.has(char)) {
      push('punctuation', char)
      index += 1
      continue
    }

    if (operatorChars.has(char)) {
      const twoChar = code.slice(index, index + 2)
      if (twoCharOperators.has(twoChar)) {
        push('operator', twoChar)
        index += 2
        continue
      }
      push('operator', char)
      index += 1
      continue
    }

    push('text', char)
    index += 1
  }

  return tokens
}

const CodeBlock = ({ code, language }: { code: string; language: CodeLanguage }) => {
  const tokens = tokenizeCode(code, language)
  return (
    <pre className={`code-block language-${language}`}>
      <code>
        {tokens.map((token, tokenIndex) => (
          <span
            key={`${language}-${tokenIndex}`}
            className={token.type === 'text' ? undefined : `token token-${token.type}`}
          >
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  )
}

function App() {
  const [longUrl, setLongUrl] = useState('')
  const [result, setResult] = useState<ShortResult | null>(null)
  const [history, setHistory] = useState<ShortResult[]>(() => {
    const saved = localStorage.getItem('url-shortener-history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return []
      }
    }
    return []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('url-shortener-history', JSON.stringify(history))
  }, [history])
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

    // Check for duplicates
    const existingEntry = history.find((item) => item.longUrl === normalized)
    if (existingEntry) {
      setResult(existingEntry)
      setHistory((prev) => [
        existingEntry,
        ...prev.filter((item) => item.id !== existingEntry.id),
      ])
      setLongUrl('')
      inputRef.current?.focus()
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
      setHistory((prev) => [entry, ...prev])
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

  const normalizedApiBaseUrl = normalizeBase(API_BASE_URL)
  const normalizedShortDomain = normalizeBase(SHORT_DOMAIN)
  const createUrlEndpoint = `${normalizedApiBaseUrl}/url-shortener`

  const curlExample = `curl -X POST "${createUrlEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com"}'`

  const javascriptExample = `const API_BASE_URL = '${normalizedApiBaseUrl}'
const SHORT_DOMAIN = '${normalizedShortDomain}'

async function shortenUrl(longUrl) {
  const res = await fetch(API_BASE_URL + '/url-shortener', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: longUrl }),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(json?.message || 'Unable to shorten')

  return json?.data?.url || (SHORT_DOMAIN + '/' + json?.data?.shortcode)
}

shortenUrl('https://example.com').then(console.log)`

  const phpExample = `<?php

$apiBaseUrl = '${normalizedApiBaseUrl}';
$shortDomain = '${normalizedShortDomain}';
$longUrl = 'https://example.com';

$payload = json_encode(['url' => $longUrl]);

$ch = curl_init($apiBaseUrl . '/url-shortener');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS => $payload,
]);

$body = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$json = json_decode($body, true);

if ($httpCode < 200 || $httpCode >= 300) {
  throw new Exception($json['message'] ?? 'Unable to shorten');
}

$short = $json['data']['url'] ?? ($shortDomain . '/' . $json['data']['shortcode']);
echo $short . PHP_EOL;`

  const requestBodyExample = `{
  "url": "https://example.com"
}`

  const sampleSuccessResponse = `{
  "status": "success",
  "data": {
    "shortcode": "SB1gw",
    "originalUrl": "https://github.com/thecompstudguy/url-shortener-fe",
    "url": "https://stl.games/SB1gw"
  },
  "_meta": {}
}`

  const sampleErrorResponse = `{
  "message": "Invalid URL"
}`

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
          <p>Revisit your shortened URLs without losing focus.</p>
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

      <section className="api-guide" aria-labelledby="api-guide-title">
        <div className="api-guide-header">
          <h2 id="api-guide-title">API guide</h2>
          <p>
            Need short links for a project, a hackathon demo, or your group chat?
            Same. Here’s the cheat sheet: send a long URL to the backend and it
            hands you back a clean short one.
          </p>
          <p>
            Try it, test it, and “abuse” it (in the friendly, caffeine-fueled
            way). Toss it weird URLs, copy/paste like it’s finals week — just be
            nice to your own server.
          </p>
        </div>

        <div className="api-guide-meta">
          <div className="api-guide-meta-item">
            <span className="api-guide-label">Base URL</span>
            <span className="api-guide-value">{normalizedApiBaseUrl}</span>
          </div>
          <div className="api-guide-meta-item">
            <span className="api-guide-label">Endpoint</span>
            <span className="api-guide-value">
              <code>POST /url-shortener</code>
            </span>
          </div>
          <div className="api-guide-meta-item">
            <span className="api-guide-label">Content type</span>
            <span className="api-guide-value">
              <code>application/json</code>
            </span>
          </div>
        </div>

        {isPlaceholderApi(API_BASE_URL) ? (
          <div className="api-guide-callout" role="note">
            <strong>Heads up:</strong> <code>VITE_API_BASE_URL</code> is set to a
            placeholder value, so the app is generating demo short links locally.
            Point it at your backend to use the real API.
          </div>
        ) : null}

        <div className="api-guide-card api-guide-card--request">
          <h3>Request body</h3>
          <p>Send JSON with a single field: the URL you want to shorten.</p>
          <CodeBlock code={requestBodyExample} language="json" />
        </div>

        <div className="api-guide-grid">
          <div className="api-guide-card">
            <h3>curl</h3>
            <CodeBlock code={curlExample} language="bash" />
          </div>

          <div className="api-guide-card">
            <h3>JavaScript</h3>
            <CodeBlock code={javascriptExample} language="javascript" />
          </div>

          <div className="api-guide-card">
            <h3>PHP</h3>
            <CodeBlock code={phpExample} language="php" />
          </div>
        </div>

        <div className="api-guide-card api-guide-card--responses">
          <h3>Sample response</h3>
          <p>
            On success you’ll usually get both <code>data.shortcode</code> and a
            full <code>data.url</code>, plus the original URL for vibes. Your
            values will differ — don’t stress it.
          </p>
          <CodeBlock code={sampleSuccessResponse} language="json" />
          <p>
            If something goes sideways, you’ll typically get a message you can
            show to the user.
          </p>
          <CodeBlock code={sampleErrorResponse} language="json" />
        </div>
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
