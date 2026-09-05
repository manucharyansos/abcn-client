import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminLayout } from './admin/AdminLayout'
import { content, type Locale } from './content'
import {
  AboutPage,
  ContactPage,
  HomePage,
  ProductDetailPage,
  ProductsPage,
  SolutionsPage,
} from './pages/PublicPages'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminContentPage } from './pages/admin/AdminContentPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminMediaPage } from './pages/admin/AdminMediaPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'

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
          <Route index element={<HomePage copy={copy} locale={locale} />} />
          <Route path="about" element={<AboutPage copy={copy} locale={locale} />} />
          <Route path="solutions" element={<SolutionsPage copy={copy} locale={locale} />} />
          <Route path="products" element={<ProductsPage copy={copy} locale={locale} />} />
          <Route path="products/:slug" element={<ProductDetailPage copy={copy} locale={locale} />} />
          <Route path="contact" element={<ContactPage copy={copy} locale={locale} />} />
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="media" element={<AdminMediaPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
