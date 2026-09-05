import {
  FileStack, Images, Inbox, LayoutDashboard, LogOut, PackageSearch, Tags,
} from 'lucide-react'
import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../api'

export const TOKEN_KEY = 'abcn-admin-token'

export type AdminContext = { token: string }

const navigation = [
  { to: '/admin', end: true, label: 'Վահանակ', icon: LayoutDashboard },
  { to: '/admin/inquiries', label: 'Հարցումներ', icon: Inbox },
  { to: '/admin/content', label: 'Բովանդակություն', icon: FileStack },
  { to: '/admin/categories', label: 'Կատեգորիաներ', icon: Tags },
  { to: '/admin/products', label: 'Ապրանքներ', icon: PackageSearch },
  { to: '/admin/media', label: 'Ֆայլեր', icon: Images },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const token = window.sessionStorage.getItem(TOKEN_KEY) ?? ''

  if (!token) return <Navigate to="/admin/login" replace />

  async function logout() {
    try {
      await api.logout(token)
    } catch {
      // The local session still needs to close if the API is unavailable.
    }
    window.sessionStorage.removeItem(TOKEN_KEY)
    window.sessionStorage.removeItem('abcn-admin-name')
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin"><img src="/images/abcn-logo.png" alt="ABCN" /></Link>
        <nav aria-label="Administration">
          {navigation.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} title={label}>
              <Icon /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={() => void logout()}><LogOut /><span>Դուրս գալ</span></button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div><p>ABCN ADMIN</p><strong>{window.sessionStorage.getItem('abcn-admin-name') ?? 'Administrator'}</strong></div>
          <Link to="/" target="_blank">Բացել կայքը</Link>
        </header>
        <Outlet context={{ token } satisfies AdminContext} />
      </section>
    </main>
  )
}
