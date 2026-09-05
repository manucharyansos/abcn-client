import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Inbox, Search } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { AdminRequestsTable } from '../../admin/AdminRequestsTable'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading, Pagination } from '../../admin/shared'
import { api, type ContactRequestRecord, type Paginated } from '../../api'

export function AdminInquiriesPage() {
  const { token } = useOutletContext<AdminContext>()
  const [data, setData] = useState<Paginated<ContactRequestRecord> | null>(null)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await api.getContactRequests(token, { page, status, search: query }))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Հարցումները չբեռնվեցին։')
    } finally {
      setLoading(false)
    }
  }, [page, query, status, token])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
  }

  async function updateStatus(request: ContactRequestRecord, nextStatus: ContactRequestRecord['status']) {
    try {
      const updated = await api.updateRequestStatus(token, request.id, nextStatus)
      setData((current) => current ? { ...current, data: current.data.map((item) => item.id === updated.id ? updated : item) } : current)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Կարգավիճակը չփոխվեց։')
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="CRM" title="Հարցումներ" />
      <form className="admin-filters" onSubmit={submitSearch}>
        <label className="admin-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Անուն, ընկերություն, email կամ հեռախոս" /></label>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
          <option value="">Բոլոր կարգավիճակները</option><option value="new">Նոր</option><option value="in_progress">Ընթացքում</option><option value="completed">Ավարտված</option><option value="archived">Արխիվ</option>
        </select>
        <button className="admin-primary-button">Փնտրել</button>
      </form>
      <AdminError message={error} />
      {loading && <AdminLoading />}
      {data && <section className="admin-panel">
        {data.data.length ? <AdminRequestsTable requests={data.data} onStatus={(request, nextStatus) => void updateStatus(request, nextStatus)} /> : <div className="admin-empty"><Inbox /><h3>Հարցում չի գտնվել</h3><p>Փոխեք որոնման կամ կարգավիճակի պայմանները։</p></div>}
        <Pagination current={data.current_page} last={data.last_page} onChange={setPage} />
      </section>}
    </>
  )
}
