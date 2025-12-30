import { useRef, useState, useEffect, type FormEvent } from 'react'
import {
  API_BASE_URL,
  SHORT_DOMAIN,
  CONTACT_EMAIL,
  UNIVERSITEA_BANNER_URL,
  UNIVERSITEA_REDDIT_DISCUSSION_URL,
  UNIVERSITEA_INTRO_COOKIE,
} from '../utils/constants'
import type { ShortResult } from '../utils/types'
import {
  getCookie,
  setCookie,
  requestShortUrl,
  normalizeBase,
  isPlaceholderApi,
} from '../utils/helpers'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'
import { CodeBlock } from '../components/common/CodeBlock'

export const HomePage = () => {
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

    let timerDone = false
    let imageDone = false

    const tryShowModal = () => {
      if (timerDone && imageDone) {
        setShowUniversiTeaModal(true)
      }
    }

    const timeoutId = window.setTimeout(() => {
      timerDone = true
      tryShowModal()
    }, 2000)

    const img = new Image()
    img.onload = () => {
      imageDone = true
      tryShowModal()
    }
    img.onerror = () => {
      // If the image fails to load, we still show the modal after the delay
      // to avoid blocking the announcement.
      imageDone = true
      tryShowModal()
    }
    img.src = UNIVERSITEA_BANNER_URL

    return () => {
      window.clearTimeout(timeoutId)
      img.onload = null
      img.onerror = null
    }
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
              decoding="async"
            />
            <h2 id="universitea-modal-title">UNIVERSITEA IS COMING SOON</h2>
            <p id="universitea-modal-description">
              UniversiTEA is the project I’m working on next — a Telegram Mini App
              for student-only, school-scoped anonymous posts and discussions.
              It’s coming soon, but the coming weeks are stacked with deadlines,
              write-ups, and build work, so I’m releasing things incrementally.
            </p>
            <p id="universitea-modal-reddit">
              This URL Shortener goes out first as a small, polished release. If
              you want the context behind UniversiTEA, the{' '}
              <a
                href={UNIVERSITEA_REDDIT_DISCUSSION_URL}
                target="_blank"
                rel="noreferrer"
              >
                Reddit discussion
              </a>{' '}
              is linked below.
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

        <div className="api-guide-card api-guide-card--samples">
          <h3>Code samples</h3>
          <p>curl</p>
          <CodeBlock code={curlExample} language="bash" />

          <p>Java</p>
          <CodeBlock code={javaExample} language="java" />

          <p>JavaScript</p>
          <CodeBlock code={javascriptExample} language="javascript" />

          <p>PHP</p>
          <CodeBlock code={phpExample} language="php" />
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
