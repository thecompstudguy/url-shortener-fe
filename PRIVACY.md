# Privacy Policy

Last updated: 2025-12-28

This Privacy Policy explains what information this URL Shortener site stores, what it sends to the backend API, and what third parties may receive when you use it.

If you have questions, email `the.compstud.guy@universitea.shop`.

## What this site stores in your browser

### Recent links (localStorage)
- The site stores your “Recent links” history in your browser using `localStorage` under the key `url-shortener-history`.
- This can include the original (long) URL, the shortened URL, and timestamps.
- This data stays on your device until you clear your browser’s site data (or remove it from localStorage).

### UniversiTEA intro modal (cookie)
- The site sets one small cookie named `universitea_intro_seen` after you dismiss the UniversiTEA announcement modal.
- Purpose: remember not to show the modal again on your device.
- This cookie is functional (not advertising/analytics) and is set with `SameSite=Lax`.

## What is sent to the backend API

When you shorten a URL, the site sends the URL you entered to the configured backend API endpoint (`POST /url-shortener`). The API base URL is configured via environment variables on the site deployment.

The backend may receive and log standard request data (for example: IP address, user agent, timestamps, and the submitted URL). The frontend cannot control the backend’s retention policies.

## What the site does *not* do

- No ad tracking pixels.
- No selling of your data.
- No intentional collection of “sensitive personal information”.

## Third-party services and links

Using this site may result in requests to third parties:
- **Google Fonts** (the site loads fonts from `fonts.googleapis.com` / `fonts.gstatic.com`).
- **GitHub** and **Reddit** links (only when you click them).
- Any destination website you open via a shortened or original URL.

Those services have their own privacy policies and may collect standard web request data.

## Your choices

- Clear “Recent links”: clear this site’s storage in your browser settings (or delete `url-shortener-history` from localStorage).
- Clear the UniversiTEA modal cookie: delete this site’s cookies in your browser settings.

## Security

We try to keep things safe, but no website can guarantee perfect security. Avoid shortening URLs that contain secrets (tokens, private IDs, etc.).

## Changes to this policy

This policy may be updated from time to time. The “Last updated” date will change when it does.
