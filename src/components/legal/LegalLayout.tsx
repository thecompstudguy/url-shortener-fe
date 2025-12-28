import type { ReactNode } from 'react'
import { LEGAL_LAST_UPDATED } from '../../utils/constants'
import { SiteHeader } from '../layout/SiteHeader'
import { SiteFooter } from '../layout/SiteFooter'

interface LegalLayoutProps {
  title: string
  children: ReactNode
}

export const LegalLayout = ({ title, children }: LegalLayoutProps) => (
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
