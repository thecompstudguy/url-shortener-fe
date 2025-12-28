import { CONTACT_EMAIL } from '../../utils/constants'
import { LegalLayout } from './LegalLayout'

export const TermsPage = () => (
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
