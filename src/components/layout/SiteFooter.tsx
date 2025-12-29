import { AUTHOR_GITHUB_URL, CONTACT_EMAIL } from '../../utils/constants'

export const SiteFooter = () => (
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
