import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { FileStack, Save } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading, AdminSuccess } from '../../admin/shared'
import { api, type AdminPage, type PageLocaleContent, type PageMeta } from '../../api'

const pageNames: Record<string, string> = {
  home: 'Գլխավոր էջ', about: 'Մեր մասին', solutions: 'Լուծումներ', products: 'Ապրանքներ', contact: 'Կապ',
}

const emptyContent: PageLocaleContent = { eyebrow: '', title: '', lead: '', body: '' }
const emptyMeta: PageMeta = { title: '', description: '' }

function normalizePage(page: AdminPage): AdminPage {
  return {
    ...page,
    content: {
      hy: { ...emptyContent, ...page.content.hy },
      en: { ...emptyContent, ...page.content.en },
    },
    meta: {
      hy: { ...emptyMeta, ...page.meta?.hy },
      en: { ...emptyMeta, ...page.meta?.en },
    },
  }
}

function LocaleEditor({ locale, label, page, onChange, onMeta }: {
  locale: 'hy' | 'en'
  label: string
  page: AdminPage
  onChange: (key: keyof PageLocaleContent, value: string) => void
  onMeta: (key: keyof PageMeta, value: string) => void
}) {
  const content = page.content[locale] as PageLocaleContent
  const meta = page.meta?.[locale] as PageMeta
  return (
    <section className="admin-language-card">
      <div className="admin-language-title"><span>{locale.toUpperCase()}</span><h2>{label}</h2></div>
      <label><span>Փոքր վերնագիր</span><input value={content.eyebrow} onChange={(event) => onChange('eyebrow', event.target.value)} /></label>
      <label><span>Գլխավոր վերնագիր</span><textarea rows={2} value={content.title} onChange={(event) => onChange('title', event.target.value)} required /></label>
      <label><span>Ներածական տեքստ</span><textarea rows={4} value={content.lead} onChange={(event) => onChange('lead', event.target.value)} required /></label>
      <label><span>Լրացուցիչ տեքստ</span><textarea rows={5} value={content.body} onChange={(event) => onChange('body', event.target.value)} /></label>
      <div className="admin-separator" />
      <h3>SEO</h3>
      <label><span>Browser title</span><input value={meta.title} onChange={(event) => onMeta('title', event.target.value)} /></label>
      <label><span>Meta description</span><textarea rows={3} value={meta.description} onChange={(event) => onMeta('description', event.target.value)} /></label>
    </section>
  )
}

export function AdminContentPage() {
  const { token } = useOutletContext<AdminContext>()
  const [pages, setPages] = useState<AdminPage[]>([])
  const [selected, setSelected] = useState<AdminPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    try {
      const result = (await api.getPages(token)).map(normalizePage)
      setPages(result)
      setSelected((current) => result.find((page) => page.id === current?.id) ?? result[0] ?? null)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Էջերը չբեռնվեցին։')
    } finally {
      setLoading(false)
    }
  }, [token])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  function updateContent(locale: 'hy' | 'en', key: keyof PageLocaleContent, value: string) {
    setSelected((current) => current ? {
      ...current,
      content: { ...current.content, [locale]: { ...current.content[locale], [key]: value } },
    } : current)
  }

  function updateMeta(locale: 'hy' | 'en', key: keyof PageMeta, value: string) {
    setSelected((current) => current ? {
      ...current,
      meta: { ...(current.meta ?? {}), [locale]: { ...(current.meta?.[locale] ?? emptyMeta), [key]: value } },
    } : current)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!selected) return
    setSaving(true)
    setSuccess('')
    try {
      const updated = normalizePage(await api.updatePage(token, selected))
      setPages((current) => current.map((page) => page.id === updated.id ? updated : page))
      setSelected(updated)
      setSuccess('Էջի փոփոխությունները պահպանվել են։')
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Փոփոխությունները չպահպանվեցին։')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="ԿԱՅՔԻ ԷՋԵՐ" title="Բովանդակություն" />
      <AdminError message={error} /><AdminSuccess message={success} />
      {loading && <AdminLoading />}
      {!loading && pages.length === 0 && <div className="admin-empty admin-panel"><FileStack /><h3>Էջեր չկան</h3><p>API-ում գործարկեք database seeder-ը։</p></div>}
      {selected && <form className="admin-editor-layout" onSubmit={save}>
        <aside className="admin-record-list">
          {pages.map((page) => <button type="button" key={page.id} className={selected.id === page.id ? 'active' : ''} onClick={() => { setSelected(normalizePage(page)); setSuccess('') }}><span>{pageNames[page.slug] ?? page.slug}</span><small>{page.status}</small></button>)}
        </aside>
        <div className="admin-editor-main">
          <div className="admin-editor-toolbar">
            <div><strong>{pageNames[selected.slug] ?? selected.slug}</strong><span>/{selected.slug}</span></div>
            <label><span>Վիճակ</span><select value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value as AdminPage['status'] })}><option value="draft">Սևագիր</option><option value="published">Հրապարակված</option><option value="archived">Արխիվ</option></select></label>
            <button className="admin-primary-button" disabled={saving}><Save />{saving ? 'Պահպանվում է…' : 'Պահպանել'}</button>
          </div>
          <div className="admin-language-grid">
            <LocaleEditor locale="hy" label="Հայերեն" page={selected} onChange={(key, value) => updateContent('hy', key, value)} onMeta={(key, value) => updateMeta('hy', key, value)} />
            <LocaleEditor locale="en" label="English" page={selected} onChange={(key, value) => updateContent('en', key, value)} onMeta={(key, value) => updateMeta('en', key, value)} />
          </div>
        </div>
      </form>}
    </>
  )
}
