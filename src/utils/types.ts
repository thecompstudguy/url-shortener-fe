export type ShortResult = {
  id: string
  longUrl: string
  shortUrl: string
  createdAt: string
}

export interface ApiResponse {
  status?: string
  data?: { url?: string; shortcode?: string; originalUrl?: string }
  message?: string
  _meta?: Record<string, unknown>
}

export type AppRoute = 'home' | 'privacy' | 'terms'

export type CodeLanguage = 'bash' | 'javascript' | 'php' | 'java' | 'json'

export type CodeTokenType =
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

export type CodeToken = { type: CodeTokenType; value: string }
