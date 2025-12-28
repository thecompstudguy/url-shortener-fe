import { API_BASE_URL, SHORT_DOMAIN } from './constants'
import type { ApiResponse, AppRoute } from './types'

export const isPlaceholderApi = (baseUrl: string) =>
  baseUrl.includes('placeholder') || baseUrl.includes('example')

export const normalizeBase = (value: string) =>
  value.endsWith('/') ? value.slice(0, -1) : value

export const buildShortUrl = (domain: string, slug: string) =>
  `${normalizeBase(domain)}/${slug}`

export const createSlug = () => Math.random().toString(36).slice(2, 8)

export const getCookie = (name: string) => {
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

export const setCookie = (name: string, value: string, maxAgeDays: number) => {
  if (typeof document === 'undefined') {
    return
  }

  const maxAgeSeconds = Math.floor(maxAgeDays * 24 * 60 * 60)
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=/; samesite=lax`
}

export const requestShortUrl = async (targetUrl: string): Promise<string> => {
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

export const getRouteFromLocation = (): AppRoute => {
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
