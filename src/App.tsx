import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminLayout } from './admin/AdminLayout'
import { content, type Locale } from './content'
import { api, type AdminPage } from './api'
import { applyManagedPages } from './pageContent'
import {
  AboutPage,
  ContactPage,
  HomePage,
  ProductDetailPage,
  ProductsPage,
} from './pages/PublicPages'
import {
  NewsDetailPage, NewsPage, ProjectDetailPage, ProjectsPage, ServiceDetailPage, ServicesPage,
} from './pages/ManagedContentPages'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminContentPage } from './pages/admin/AdminContentPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminMediaPage } from './pages/admin/AdminMediaPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminEntriesPage } from './pages/admin/AdminEntriesPage'
import { ComparePage } from './pages/ComparePage'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return null
}

function App() {
  const [managedPages, setManagedPages] = useState<AdminPage[]>([])
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

  useEffect(() => {
    let active = true
    api.getPublicSiteContent()
      .then((pages) => { if (active) setManagedPages(pages) })
      .catch(() => { if (active) setManagedPages([]) })
    return () => { active = false }
  }, [])

  const { copy, companyInfo } = applyManagedPages(content[locale], managedPages, locale)

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          element={<Layout locale={locale} setLocale={setLocale} copy={copy} companyInfo={companyInfo} />}
        >
          <Route index element={<HomePage copy={copy} locale={locale} />} />
          <Route path="about" element={<AboutPage copy={copy} locale={locale} />} />
          <Route path="solutions" element={<Navigate to="/services" replace />} />
          <Route path="services" element={<ServicesPage copy={copy} locale={locale} />} />
          <Route path="services/:slug" element={<ServiceDetailPage copy={copy} locale={locale} />} />
          <Route path="projects" element={<ProjectsPage copy={copy} locale={locale} />} />
          <Route path="projects/:slug" element={<ProjectDetailPage copy={copy} locale={locale} />} />
          <Route path="news" element={<NewsPage copy={copy} locale={locale} />} />
          <Route path="news/:slug" element={<NewsDetailPage copy={copy} locale={locale} />} />
          <Route path="products" element={<ProductsPage copy={copy} locale={locale} />} />
          <Route path="products/:slug" element={<ProductDetailPage copy={copy} locale={locale} />} />
          <Route path="compare" element={<ComparePage copy={copy} locale={locale} />} />
          <Route path="contact" element={<ContactPage copy={copy} locale={locale} companyInfo={companyInfo} />} />
        </Route>
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="services" element={<AdminEntriesPage kind="services" />} />
          <Route path="projects" element={<AdminEntriesPage kind="projects" />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="news" element={<AdminEntriesPage kind="news" />} />
          <Route path="team" element={<AdminEntriesPage kind="team" />} />
          <Route path="media" element={<AdminMediaPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
