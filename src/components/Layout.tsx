import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { company, type Locale, type SiteCopy } from '../content'

type LayoutProps = {
  locale: Locale
  setLocale: (locale: Locale) => void
  copy: SiteCopy
}

export function Layout({ locale, setLocale, copy }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    ['/', copy.nav.home], ['/about', copy.nav.about], ['/solutions', copy.nav.solutions],
    ['/products', copy.nav.products], ['/contact', copy.nav.contact],
  ] as const

  useEffect(() => {
    if (!menuOpen) return

    document.body.classList.add('menu-open')
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.classList.remove('menu-open')
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">{copy.nav.skip}</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="ABCN home" onClick={closeMenu}>
            <img src="/images/abcn-logo.png" alt="ABCN" />
          </Link>

          <nav id="main-navigation" className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label={copy.nav.label}>
            {navigation.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={closeMenu}>{label}</NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <div className="language-switch" aria-label="Language">
              <button className={locale === 'hy' ? 'active' : ''} onClick={() => setLocale('hy')}>HY</button>
              <span>/</span>
              <button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')}>EN</button>
            </div>
            <Link className="header-cta" to="/contact" onClick={closeMenu}>
              {copy.nav.project}<ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <button
              className="menu-toggle" type="button" aria-label={menuOpen ? copy.nav.close : copy.nav.menu}
              aria-controls="main-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      {menuOpen ? <button className="mobile-nav-backdrop" type="button" aria-label={copy.nav.close} onClick={closeMenu} /> : null}

      <main id="main-content" key={location.pathname}><Outlet /></main>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <img className="footer-logo" src="/images/abcn-logo.png" alt="ABCN" />
            <p>{copy.footer.line}</p>
          </div>
          <nav className="footer-nav" aria-label={copy.nav.label}>
            {navigation.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          </nav>
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
