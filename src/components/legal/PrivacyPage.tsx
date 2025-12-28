import { CONTACT_EMAIL } from '../../utils/constants'
import { LegalLayout } from './LegalLayout'

export const PrivacyPage = () => (
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
