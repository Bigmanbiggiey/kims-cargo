import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router'
import { Layout } from './components/layout/Layout'
import { isLocale, LocaleProvider } from './i18n/locale'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { FleetPage } from './pages/FleetPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { QuotePage } from './pages/QuotePage'
import { RoutesPage } from './pages/RoutesPage'
import { ServicesPage } from './pages/ServicesPage'

/** Validates the language prefix; anything else is redirected to the English equivalent. */
function LocaleGate() {
  const { lang = '' } = useParams()
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (isLocale(lang)) document.documentElement.lang = lang
  }, [lang])

  if (!isLocale(lang)) {
    const segments = pathname.split('/').filter(Boolean)
    // A two-letter first segment is an unsupported language code ("/fr/fleet"): drop it.
    // Anything else is a page without a prefix ("/fleet"): keep it.
    const rest = /^[a-z]{2}$/i.test(segments[0] ?? '') ? segments.slice(1) : segments
    return <Navigate to={`/en${rest.length ? `/${rest.join('/')}` : ''}${search}`} replace />
  }

  return (
    <LocaleProvider locale={lang}>
      <Layout />
    </LocaleProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path=":lang" element={<LocaleGate />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="fleet" element={<FleetPage />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="quote" element={<QuotePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
