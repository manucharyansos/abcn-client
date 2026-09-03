import { type FormEvent, useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft, FileStack, Inbox, LayoutDashboard, LoaderCircle, LogOut,
  PackageSearch, RefreshCw, Settings2,
} from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { api, type ContactRequestRecord } from '../api'

const TOKEN_KEY = 'abcn-admin-token'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (window.sessionStorage.getItem(TOKEN_KEY)) return <Navigate to="/admin" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    try {
      const result = await api.login(String(form.get('email')), String(form.get('password')))
      window.sessionStorage.setItem(TOKEN_KEY, result.token)
      window.sessionStorage.setItem('abcn-admin-name', result.user.name)
      navigate('/admin')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <Link className="admin-back" to="/"><ArrowLeft size={17} />Back to website</Link>
      <section className="admin-login-card">
        <img src="/images/abcn-logo.png" alt="ABCN" />
        <div><p>ADMINISTRATION</p><h1>Welcome back</h1><span>Sign in to manage ABCN website inquiries and content.</span></div>
        <form onSubmit={submit}>
          <label><span>Email</span><input name="email" type="email" autoComplete="username" required /></label>
          <label><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="button button-primary dark-button" disabled={loading}>
            {loading && <LoaderCircle className="spin" size={18} />}Sign in
          </button>
          {error && <p className="form-status error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  )
}

type DashboardData = Awaited<ReturnType<typeof api.getDashboard>>

export function AdminDashboardPage() {
  const token = window.sessionStorage.getItem(TOKEN_KEY) ?? ''
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!token) return
    try {
      setData(await api.getDashboard(token))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [token])

  // The dashboard is remote state and is intentionally loaded once authentication is available.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  if (!token) return <Navigate to="/admin/login" replace />

  const logout = () => {
    window.sessionStorage.removeItem(TOKEN_KEY)
    window.sessionStorage.removeItem('abcn-admin-name')
    window.location.assign('/admin/login')
  }

  async function updateStatus(request: ContactRequestRecord, status: ContactRequestRecord['status']) {
    try {
      const updated = await api.updateRequestStatus(token, request.id, status)
      setData((current) => current ? {
        ...current,
        requests: current.requests.map((item) => item.id === updated.id ? updated : item),
      } : current)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update request')
    }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <img src="/images/abcn-logo.png" alt="ABCN" />
        <nav>
          <a className="active" href="#dashboard"><LayoutDashboard />Dashboard</a>
          <a href="#requests"><Inbox />Inquiries</a>
          <a href="#content"><FileStack />Content</a>
          <a href="#products"><PackageSearch />Products</a>
          <a href="#settings"><Settings2 />Settings</a>
        </nav>
        <button onClick={logout}><LogOut />Sign out</button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div><p>ABCN ADMIN</p><h1>Dashboard</h1></div>
          <div><span>{window.sessionStorage.getItem('abcn-admin-name') ?? 'Administrator'}</span><Link to="/">Open website</Link></div>
        </header>

        {error && <div className="admin-error"><span>{error}</span><button onClick={() => { setLoading(true); void load() }}><RefreshCw />Retry</button></div>}
        {loading && <div className="admin-loading"><LoaderCircle className="spin" />Loading dashboard…</div>}

        {data && (
          <>
            <div className="admin-metrics" id="dashboard">
              <article><span>New inquiries</span><strong>{data.counts.new_requests}</strong><Inbox /></article>
              <article><span>Total inquiries</span><strong>{data.counts.total_requests}</strong><FileStack /></article>
              <article><span>Published pages</span><strong>{data.counts.pages}</strong><LayoutDashboard /></article>
              <article><span>Products</span><strong>{data.counts.products}</strong><PackageSearch /></article>
            </div>

            <section className="admin-panel" id="requests">
              <div className="admin-panel-heading"><div><p>INQUIRIES</p><h2>Latest project requests</h2></div><button onClick={() => { setLoading(true); void load() }}><RefreshCw />Refresh</button></div>
              {data.requests.length === 0 ? (
                <div className="admin-empty"><Inbox /><h3>No inquiries yet</h3><p>New website inquiries will appear here.</p></div>
              ) : (
                <div className="request-table-wrap">
                  <table className="request-table">
                    <thead><tr><th>Contact</th><th>Message</th><th>Received</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.requests.map((request) => (
                        <tr key={request.id}>
                          <td><strong>{request.name}</strong><a href={`mailto:${request.email}`}>{request.email}</a><span>{request.phone}</span></td>
                          <td><p>{request.message}</p>{request.company && <span>{request.company}</span>}</td>
                          <td>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(request.created_at))}</td>
                          <td>
                            <select value={request.status} onChange={(event) => void updateStatus(request, event.target.value as ContactRequestRecord['status'])}>
                              <option value="new">New</option><option value="in_progress">In progress</option>
                              <option value="completed">Completed</option><option value="archived">Archived</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="admin-coming-grid">
              <section className="admin-panel" id="content"><FileStack /><h2>Content manager</h2><p>Bilingual pages and SEO fields are ready in the API foundation. The editing interface is the next project slice.</p></section>
              <section className="admin-panel" id="products"><PackageSearch /><h2>Product catalog</h2><p>Categories, specifications and documents are prepared for verified catalog content.</p></section>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
