import { useRef, useState, useEffect, type FormEvent, type ReactNode } from 'react'
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

const CONTACT_EMAIL = 'the.compstud.guy@universitea.shop'
const AUTHOR_GITHUB_URL = 'https://github.com/thecompstudguy'
const REPO_BACKEND_URL = 'https://github.com/thecompstudguy/url-shortener-be'
const REPO_FRONTEND_URL = 'https://github.com/thecompstudguy/url-shortener-fe'

const HOME_DOCUMENT_TITLE = 'URL Shortener — Fast, clean short links'
const TERMS_DOCUMENT_TITLE = 'Terms of Use · URL Shortener'
const PRIVACY_DOCUMENT_TITLE = 'Privacy Policy · URL Shortener'
const LEGAL_LAST_UPDATED = '2025-12-28'

const UNIVERSITEA_BANNER_URL = 'https://assets.universitea.shop/banner-logo.png'
const UNIVERSITEA_REDDIT_DISCUSSION_URL =
  'https://www.reddit.com/r/AteneodeCagayan/comments/1pn64bc/anonymous_teaconfession_app_prototype/'
const UNIVERSITEA_INTRO_COOKIE = 'universitea_intro_seen'

const getCookie = (name: string) => {
  if (typeof document === 'undefined') {
    return null
  }

  const prefix = `${encodeURIComponent(name)}=`
  const entries = document.cookie.split('; ')

  for (const entry of entries) {
    if (entry.startsWith(prefix)) {
      return decodeURIComponent(entry.slice(prefix.length))
    }
  }

  return null
}

const setCookie = (name: string, value: string, maxAgeDays: number) => {
  if (typeof document === 'undefined') {
    return
  }

  const maxAgeSeconds = Math.floor(maxAgeDays * 24 * 60 * 60)
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; samesite=lax`
}

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

type CodeLanguage = 'bash' | 'javascript' | 'php' | 'java' | 'json'

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

const JAVA_KEYWORDS = new Set([
  'abstract',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'if',
  'implements',
  'import',
  'instanceof',
  'int',
  'interface',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'strictfp',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'void',
  'volatile',
  'while',
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
      (language === 'javascript' || language === 'php' || language === 'java') &&
      char === '/' &&
      code[index + 1] === '/'
    const isBlockCommentStart =
      (language === 'javascript' || language === 'php' || language === 'java') &&
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

      if (language === 'java' && JAVA_KEYWORDS.has(word)) {
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

const GitHubIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
)

const SiteHeader = () => {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
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
          href={AUTHOR_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
        >
          By TheCompSTUDGuy
        </a>
      </div>
      <div className="repo-links" aria-label="Project repositories">
        <span className="repo-links-label">GitHub repos</span>
        <div className="repo-links-list">
          <a className="repo-link" href={REPO_BACKEND_URL} target="_blank" rel="noreferrer">
            <GitHubIcon />
            url-shortener-be
          </a>
          <a className="repo-link" href={REPO_FRONTEND_URL} target="_blank" rel="noreferrer">
            <GitHubIcon />
            url-shortener-fe
          </a>
        </div>
      </div>
    </header>
  )
}

const SiteFooter = () => (
  <footer className="footer">
    <div className="footer-content">
      <span>Built for fast sharing and crisp short links.</span>
      <span>
        Made by{' '}
        <a href={AUTHOR_GITHUB_URL} target="_blank" rel="noreferrer">
          TheCompSTUDGuy
        </a>
        {' · '}
        Contact:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        {' · '}
        <a href="#/terms">Terms</a>
        {' · '}
        <a href="#/privacy">Privacy</a>
      </span>
    </div>
  </footer>
)

const LegalLayout = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <div className="page legal-page">
    <SiteHeader />
    <main className="main legal-main">
      <section className="legal-panel" aria-labelledby="legal-title">
        <a className="legal-back" href="#/">
          ← Back to URL Shortener
        </a>
        <h1 className="legal-title" id="legal-title">
          {title}
        </h1>
        <p className="legal-updated">Last updated: {LEGAL_LAST_UPDATED}</p>
        <div className="legal-body">{children}</div>
      </section>
    </main>
    <SiteFooter />
  </div>
)

const TermsPage = () => (
  <LegalLayout title="Terms of Use">
    <p>
      These Terms of Use apply to this URL Shortener site and its related API
      service (the “Service”). By using the Service, you agree to these terms.
    </p>
    <p>
      Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
    </p>

    <h2>Use at your own risk</h2>
    <p>
      The Service is provided “as is” and “as available”, without warranties of any
      kind. We do not guarantee that the Service will be uninterrupted, secure, or
      error-free.
    </p>

    <h2>Acceptable use</h2>
    <p>You agree not to use the Service to create or share links that:</p>
    <ul>
      <li>are illegal, malicious, or deceptive (malware, phishing, scams, fraud),</li>
      <li>violate someone else’s rights (copyright, trademarks, privacy),</li>
      <li>are used to harass, threaten, or harm others,</li>
      <li>attempt to bypass security, rate limits, or abuse protections.</li>
    </ul>

    <h2>Link safety</h2>
    <p>
      Shortened links can point to third-party websites. We do not control those
      destinations and are not responsible for their content, availability, or
      policies. Use caution before clicking links, even short ones.
    </p>

    <h2>Moderation and removal</h2>
    <p>
      We may remove, disable, or refuse to generate short links at any time, for
      any reason (including abuse prevention, legal compliance, or operational
      safety).
    </p>

    <h2>Limitation of liability</h2>
    <p>
      To the maximum extent permitted by law, we are not liable for any indirect,
      incidental, special, consequential, or punitive damages, or any loss of data,
      revenue, or profits arising from your use of the Service.
    </p>

    <h2>Changes</h2>
    <p>
      We may update these Terms from time to time. Continued use of the Service
      after changes means you accept the updated Terms.
    </p>
  </LegalLayout>
)

const PrivacyPage = () => (
  <LegalLayout title="Privacy Policy">
    <p>
      This Privacy Policy explains what information this URL Shortener site stores,
      what it sends to the backend API, and what third parties may receive when you
      use it.
    </p>
    <p>
      Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
    </p>

    <h2>What this site stores in your browser</h2>

    <h3>Recent links (localStorage)</h3>
    <ul>
      <li>
        The site stores your “Recent links” history in your browser using{' '}
        <code>localStorage</code> under the key <code>url-shortener-history</code>.
      </li>
      <li>
        This can include the original (long) URL, the shortened URL, and timestamps.
      </li>
      <li>
        This data stays on your device until you clear your browser’s site data (or
        remove it from localStorage).
      </li>
    </ul>

    <h3>UniversiTEA intro modal (cookie)</h3>
    <ul>
      <li>
        The site sets one small cookie named <code>universitea_intro_seen</code>{' '}
        after you dismiss the UniversiTEA announcement modal.
      </li>
      <li>Purpose: remember not to show the modal again on your device.</li>
      <li>
        This cookie is functional (not advertising/analytics) and is set with{' '}
        <code>SameSite=Lax</code>.
      </li>
    </ul>

    <h2>What is sent to the backend API</h2>
    <p>
      When you shorten a URL, the site sends the URL you entered to the configured
      backend API endpoint (<code>POST /url-shortener</code>). The API base URL is
      configured via environment variables on the site deployment.
    </p>
    <p>
      The backend may receive and log standard request data (for example: IP
      address, user agent, timestamps, and the submitted URL). The frontend cannot
      control the backend’s retention policies.
    </p>

    <h2>What the site does not do</h2>
    <ul>
      <li>No ad tracking pixels.</li>
      <li>No selling of your data.</li>
      <li>No intentional collection of “sensitive personal information”.</li>
    </ul>

    <h2>Third-party services and links</h2>
    <p>Using this site may result in requests to third parties:</p>
    <ul>
      <li>
        <strong>Google Fonts</strong> (fonts are loaded from{' '}
        <code>fonts.googleapis.com</code> / <code>fonts.gstatic.com</code>).
      </li>
      <li>
        <strong>GitHub</strong> and <strong>Reddit</strong> links (only when you
        click them).
      </li>
      <li>Any destination website you open via a short or original URL.</li>
    </ul>
    <p>
      Those services have their own privacy policies and may collect standard web
      request data.
    </p>

    <h2>Your choices</h2>
    <ul>
      <li>
        Clear “Recent links”: clear this site’s storage in your browser settings (or
        delete <code>url-shortener-history</code> from localStorage).
      </li>
      <li>
        Clear the UniversiTEA modal cookie: delete this site’s cookies in your
        browser settings.
      </li>
    </ul>

    <h2>Security</h2>
    <p>
      We try to keep things safe, but no website can guarantee perfect security.
      Avoid shortening URLs that contain secrets (tokens, private IDs, etc.).
    </p>

    <h2>Changes to this policy</h2>
    <p>
      This policy may be updated from time to time. The “Last updated” date will
      change when it does.
    </p>
  </LegalLayout>
)

function HomePage() {
  const [longUrl, setLongUrl] = useState('')
  const [result, setResult] = useState<ShortResult | null>(null)
  const [showUniversiTeaModal, setShowUniversiTeaModal] = useState(false)
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
  const inputRef = useRef<HTMLInputElement>(null)
  const modalCloseRef = useRef<HTMLButtonElement>(null)

  const dismissUniversiTeaModal = () => {
    setCookie(UNIVERSITEA_INTRO_COOKIE, '1', 10 / (24 * 60))
    setShowUniversiTeaModal(false)
  }

  useEffect(() => {
    if (getCookie(UNIVERSITEA_INTRO_COOKIE)) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowUniversiTeaModal(true)
    }, 2000)

    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (!showUniversiTeaModal) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    modalCloseRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        dismissUniversiTeaModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showUniversiTeaModal])

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

  const javaExample = `// Java 11+ (HttpClient). JSON parsing uses Jackson (jackson-databind).
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ShortenUrlExample {
  public static void main(String[] args) throws Exception {
    String endpoint = "${createUrlEndpoint}";
    String shortDomain = "${normalizedShortDomain}";
    String longUrl = "https://example.com";

    HttpClient client = HttpClient.newHttpClient();
    ObjectMapper mapper = new ObjectMapper();

    String body = mapper.writeValueAsString(Map.of("url", longUrl));

    HttpRequest request = HttpRequest.newBuilder()
      .uri(URI.create(endpoint))
      .header("Content-Type", "application/json")
      .POST(HttpRequest.BodyPublishers.ofString(body))
      .build();

    HttpResponse<String> res = client.send(request, HttpResponse.BodyHandlers.ofString());
    JsonNode json = mapper.readTree(res.body());

    if (res.statusCode() < 200 || res.statusCode() >= 300) {
      String message = json.path("error").path("message").asText(
        json.path("message").asText("Unable to shorten")
      );
      throw new RuntimeException(message);
    }

    String url = json.path("data").path("url").asText("");
    String shortcode = json.path("data").path("shortcode").asText("");

    if (!url.isEmpty()) {
      System.out.println(url);
    } else if (!shortcode.isEmpty()) {
      System.out.println(shortDomain + "/" + shortcode);
    } else {
      throw new RuntimeException("Missing short URL");
    }
  }
}`

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
    "url": "${normalizedShortDomain}/SB1gw"
  },
  "_meta": {}
}`

  const sampleErrorResponse = `{
  "status": "error",
  "data": null,
  "error": {
    "code": "lesgo.utils.validateFields::MISSING_REQUIRED_URL",
    "message": "Missing required 'url'",
    "details": {
      "field": {
        "key": "url",
        "type": "string",
        "required": true
      }
    }
  },
  "_meta": {}
}`

  return (
    <div className="page">
      {showUniversiTeaModal ? (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              dismissUniversiTeaModal()
            }
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="universitea-modal-title"
            aria-describedby="universitea-modal-description universitea-modal-reddit"
          >
            <button
              type="button"
              className="modal-close"
              onClick={dismissUniversiTeaModal}
              ref={modalCloseRef}
            >
              Close
            </button>
            <img
              className="modal-banner"
              src={UNIVERSITEA_BANNER_URL}
              alt="UniversiTEA banner"
              loading="lazy"
              decoding="async"
            />
            <h2 id="universitea-modal-title">UniversiTEA is coming soon</h2>
            <p id="universitea-modal-description">
              UniversiTEA is the project I’m working on next — a Telegram Mini App
              for student-only, school-scoped anonymous posts and discussions.
              It’s dropping soon. For now, I’m shipping this URL Shortener as a
              clean little release first.
            </p>
            <p id="universitea-modal-reddit">
              Want the context? Here’s the{' '}
              <a
                href={UNIVERSITEA_REDDIT_DISCUSSION_URL}
                target="_blank"
                rel="noreferrer"
              >
                Reddit discussion
              </a>
              .
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-primary"
                onClick={dismissUniversiTeaModal}
              >
                Got it
              </button>
              <a
                className="modal-secondary"
                href={UNIVERSITEA_REDDIT_DISCUSSION_URL}
                target="_blank"
                rel="noreferrer"
              >
                Reddit discussion
              </a>
              <a
                className="modal-secondary"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      ) : null}
      <SiteHeader />

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
                  <a
                    className="history-short history-short-link"
                    href={item.shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={item.longUrl}
                  >
                    {item.shortUrl}
                  </a>
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
                    href={item.longUrl}
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
            Built during late nights, caffeine-fueled sessions, and the kind of
            crunch that comes with deadlines and submissions. This API is meant
            to help with day-to-day work — projects, experiments, quick tools,
            submissions, and anything you’re building to get something over the
            line.
          </p>
          <p>
            If you’ve been a professional for a while, feel free to{' '}
            <em>abuse</em> the API — stress-test it like it’s headed for
            production.
          </p>
          <p>
            Throw edge cases at it. Toss in gnarly URLs. Try weird inputs. Mash
            the button. If you break something interesting, that’s a win. Just
            keep it ethical: no DDoS vibes, no legal chaos — report what you
            find.
          </p>
        </div>

        <div className="api-guide-meta">
          <div className="api-guide-meta-item">
            <span className="api-guide-label">Endpoint</span>
            <span className="api-guide-value">
              <code>POST {createUrlEndpoint}</code>
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
          <p>Send JSON with one field: the URL you want to shrink into a tiny link.</p>
          <CodeBlock code={requestBodyExample} language="json" />
        </div>

        <div className="api-guide-grid">
          <div className="api-guide-card">
            <h3>curl</h3>
            <CodeBlock code={curlExample} language="bash" />
          </div>

          <div className="api-guide-card">
            <h3>Java</h3>
            <CodeBlock code={javaExample} language="java" />
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
            On success you’ll usually get a <code>data.shortcode</code>, the
            original URL, and the full short URL. Your values will differ — the
            format is what matters.
          </p>
          <CodeBlock code={sampleSuccessResponse} language="json" />
          <p>
            If something goes sideways, you’ll get an error payload you can show
            to the user (and maybe to your logs while you pretend you’re calm).
          </p>
          <CodeBlock code={sampleErrorResponse} language="json" />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

type AppRoute = 'home' | 'privacy' | 'terms'

const getRouteFromLocation = (): AppRoute => {
  if (typeof window === 'undefined') {
    return 'home'
  }

  const hashPath = window.location.hash.replace(/^#/, '').split('?')[0]
  const rawPath = hashPath || window.location.pathname.split('?')[0]
  const normalized = rawPath.replace(/\/+$/, '') || '/'

  if (normalized === '/privacy') {
    return 'privacy'
  }

  if (normalized === '/terms') {
    return 'terms'
  }

  return 'home'
}

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromLocation())

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRouteFromLocation())
    window.addEventListener('hashchange', handleRouteChange)
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('hashchange', handleRouteChange)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)

    if (route === 'privacy') {
      document.title = PRIVACY_DOCUMENT_TITLE
      return
    }

    if (route === 'terms') {
      document.title = TERMS_DOCUMENT_TITLE
      return
    }

    document.title = HOME_DOCUMENT_TITLE
  }, [route])

  if (route === 'privacy') {
    return <PrivacyPage />
  }

  if (route === 'terms') {
    return <TermsPage />
  }

  return <HomePage />
}

export default App
