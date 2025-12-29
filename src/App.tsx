import { useState, useEffect } from 'react'
import './App.css'
import {
  HOME_DOCUMENT_TITLE,
  PRIVACY_DOCUMENT_TITLE,
  TERMS_DOCUMENT_TITLE,
} from './utils/constants'
import { getRouteFromLocation } from './utils/helpers'
import type { AppRoute } from './utils/types'
import { HomePage } from './pages/HomePage'
import { PrivacyPage } from './components/legal/PrivacyPage'
import { TermsPage } from './components/legal/TermsPage'

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromLocation())

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRouteFromLocation())
    window.addEventListener('hashchange', handleRouteChange)
    window.addEventListener('popstate', handleRouteChange)

    return () => {
      window.removeEventListener('hashchange', handleRouteChange)
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)

    if (route === 'privacy') {
      document.title = PRIVACY_DOCUMENT_TITLE
      return
    }

    if (route === 'terms') {
      document.title = TERMS_DOCUMENT_TITLE
      return
    }

    document.title = HOME_DOCUMENT_TITLE
  }, [route])

  if (route === 'privacy') {
    return <PrivacyPage />
  }

  if (route === 'terms') {
    return <TermsPage />
  }

  return <HomePage />
}

export default App
