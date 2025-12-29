import { useState } from 'react'
import { AUTHOR_GITHUB_URL, REPO_BACKEND_URL, REPO_FRONTEND_URL } from '../../utils/constants'
import { GitHubIcon } from './GitHubIcon'

export const SiteHeader = () => {
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
