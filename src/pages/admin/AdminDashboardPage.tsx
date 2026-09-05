import { useCallback, useEffect, useState } from 'react'
import { FileStack, Images, Inbox, PackageSearch, RefreshCw } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import { AdminRequestsTable } from '../../admin/AdminRequestsTable'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading } from '../../admin/shared'
import { api, type ContactRequestRecord } from '../../api'

type DashboardData = Awaited<ReturnType<typeof api.getDashboard>>

export function AdminDashboardPage() {
  const { token } = useOutletContext<AdminContext>()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setData(await api.getDashboard(token))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Տվյալները չբեռնվեցին։')
    } finally {
      setLoading(false)
    }
  }, [token])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  async function updateStatus(request: ContactRequestRecord, status: ContactRequestRecord['status']) {
    try {
      const updated = await api.updateRequestStatus(token, request.id, status)
      setData((current) => current ? {
        ...current,
        requests: current.requests.map((item) => item.id === updated.id ? updated : item),
      } : current)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Կարգավիճակը չփոխվեց։')
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="ԱՄՓՈՓՈՒՄ" title="Կառավարման վահանակ" action={<button className="admin-secondary-button" onClick={() => { setLoading(true); void load() }}><RefreshCw />Թարմացնել</button>} />
      <AdminError message={error} />
      {loading && <AdminLoading />}
      {data && <>
        <div className="admin-metrics">
          <Link to="/admin/inquiries"><span>Նոր հարցումներ</span><strong>{data.counts.new_requests}</strong><Inbox /></Link>
          <Link to="/admin/content"><span>Հրապարակված էջեր</span><strong>{data.counts.pages}</strong><FileStack /></Link>
          <Link to="/admin/products"><span>Հրապարակված ապրանքներ</span><strong>{data.counts.products}</strong><PackageSearch /></Link>
          <Link to="/admin/media"><span>Ֆայլեր</span><strong>{data.counts.media}</strong><Images /></Link>
        </div>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p>ՎԵՐՋԻՆ ՀԱՐՑՈՒՄՆԵՐԸ</p><h2>Հաճախորդների հաղորդագրություններ</h2></div><Link to="/admin/inquiries">Տեսնել բոլորը</Link></div>
          {data.requests.length ? <AdminRequestsTable requests={data.requests} onStatus={(request, status) => void updateStatus(request, status)} /> : <div className="admin-empty"><Inbox /><h3>Հարցումներ դեռ չկան</h3><p>Կայքից ուղարկված հարցումները կհայտնվեն այստեղ։</p></div>}
        </section>
      </>}
    </>
  )
}
