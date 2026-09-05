import { type FormEvent, useState } from 'react'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { TOKEN_KEY } from '../../admin/AdminLayout'
import { api } from '../../api'

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
      setError(requestError instanceof Error ? requestError.message : 'Մուտքը չհաջողվեց։')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-page">
      <Link className="admin-back" to="/"><ArrowLeft size={17} />Վերադառնալ կայք</Link>
      <section className="admin-login-card">
        <img src="/images/abcn-logo.png" alt="ABCN" />
        <div><p>ԿԱՌԱՎԱՐՄԱՆ ՎԱՀԱՆԱԿ</p><h1>Բարի վերադարձ</h1><span>Մուտք գործեք կայքի բովանդակությունն ու հարցումները կառավարելու համար։</span></div>
        <form onSubmit={submit}>
          <label><span>Էլ․ փոստ</span><input name="email" type="email" autoComplete="username" required /></label>
          <label><span>Գաղտնաբառ</span><input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="button button-primary dark-button" disabled={loading}>
            {loading && <LoaderCircle className="spin" size={18} />}Մուտք գործել
          </button>
          {error && <p className="form-status error" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  )
}
