# URL Shortener Frontend

Frontend for a simple URL Shortener app — built as a lightweight SPA using **React**, **TypeScript**, and **Vite**.

This is a small side project I’m releasing ahead of a bigger one, mainly to:
- practice clean frontend architecture
- integrate with a real backend API
- and not overthink things (for once)

---

## What does this app do?

- Accepts long URLs
- Sends them to the backend API
- Displays a clean, shortened link
- Keeps things fast, minimal, and distraction-free

No ads. No trackers. No dark UX patterns.  
Just links doing link things.

---

## Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **ESLint**

Vite gives fast dev builds, hot reloads, and fewer reasons to cry during setup.

---

## Prerequisites

Before running this locally, make sure you have:

- **Node.js** (LTS recommended)
- **npm** (comes with Node)

---

## Install & Run Locally

```bash
npm install
npm run dev
```

By default, the app will run on:

```
http://localhost:5173
```

---

## Environment Variables

This project uses **Vite environment variables** for configuration.

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

### Required Variables

```env
VITE_API_BASE_URL=<API_BASE_URL>
VITE_SHORT_DOMAIN=<SHORT_DOMAIN>
```

### What these are for

- `VITE_API_BASE_URL`  
  → The backend API endpoint used to create short URLs.

- `VITE_SHORT_DOMAIN`  
  → The base domain shown to users when displaying shortened links.

⚠️ **Do not commit `.env` files**  
They are intentionally ignored by Git.

---

## Project Structure (simplified)

```
src/
├── components/     # UI components
├── pages/          # Page-level views
├── services/       # API calls
├── utils/          # Helpers
└── main.tsx
```

Clean enough for a side project, structured enough to scale if needed.

---

## Linting

This project uses ESLint with TypeScript support.

If you want stricter rules later (recommended for production), you can enable type-aware linting using:

- `recommendedTypeChecked`
- `strictTypeChecked`
- `stylisticTypeChecked`

(Current setup favors sanity over suffering.)

---

## Why this exists

This project exists to:
- ship something small but complete
- practice frontend + backend integration
- avoid tutorial hell
- and prove that not every project needs 47 dependencies

---

## Author

**TheCompSTUDGuy**  
the.compstud.guy@universitea.shop
