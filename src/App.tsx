import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { content, type Locale } from './content'
import {
  AboutPage,
  ContactPage,
  HomePage,
  ProductsPage,
  SolutionsPage,
} from './pages/PublicPages'
import { AdminDashboardPage, AdminLoginPage } from './pages/AdminPages'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return null
}

function App() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = window.localStorage.getItem('abcn-locale')
    return saved === 'en' ? 'en' : 'hy'
  })

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale)
    window.localStorage.setItem('abcn-locale', nextLocale)
    document.documentElement.lang = nextLocale
  }

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const copy = content[locale]

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          element={<Layout locale={locale} setLocale={setLocale} copy={copy} />}
        >
          <Route index element={<HomePage copy={copy} />} />
          <Route path="about" element={<AboutPage copy={copy} />} />
          <Route path="solutions" element={<SolutionsPage copy={copy} />} />
          <Route path="products" element={<ProductsPage copy={copy} />} />
          <Route path="contact" element={<ContactPage copy={copy} locale={locale} />} />
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
