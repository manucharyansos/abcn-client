import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { company, type Locale, type SiteCopy } from '../content'

type LayoutProps = {
  locale: Locale
  setLocale: (locale: Locale) => void
  copy: SiteCopy
}

export function Layout({ locale, setLocale, copy }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const navigation = [
    ['/', copy.nav.home], ['/about', copy.nav.about], ['/solutions', copy.nav.solutions],
    ['/products', copy.nav.products], ['/contact', copy.nav.contact],
  ] as const

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="ABCN home">
            <img src="/images/abcn-logo.png" alt="ABCN" />
          </Link>

          <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Main navigation">
            {navigation.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}>{label}</NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <div className="language-switch" aria-label="Language">
              <button className={locale === 'hy' ? 'active' : ''} onClick={() => setLocale('hy')}>HY</button>
              <span>/</span>
              <button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>EN</button>
            </div>
            <Link className="header-cta" to="/contact">
              {copy.nav.project}<ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <button
              className="menu-toggle" type="button" aria-label={copy.nav.menu}
              aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main><Outlet /></main>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <img className="footer-logo" src="/images/abcn-logo.png" alt="ABCN" />
            <p>{copy.footer.line}</p>
          </div>
          <div className="footer-contact">
            <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <span>{locale === 'hy' ? company.addressHy : company.addressEn}</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {company.legalName}. {copy.footer.rights}</span>
          <Link to="/admin/login">Admin</Link>
        </div>
      </footer>
    </div>
  )
}
