import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Plus, Save, Tags, Trash2 } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading, AdminSuccess } from '../../admin/shared'
import { slugify } from '../../admin/utils'
import { api, type ProductCategory, type Status } from '../../api'

type CategoryDraft = Omit<ProductCategory, 'id' | 'parent'> & { id?: number }

const emptyCategory = (): CategoryDraft => ({
  parent_id: null, slug: '', status: 'draft', sort_order: 0,
  translations: { hy: { name: '' }, en: { name: '' } },
})

export function AdminCategoriesPage() {
  const { token } = useOutletContext<AdminContext>()
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [draft, setDraft] = useState<CategoryDraft>(emptyCategory)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    try {
      setCategories(await api.getCategories(token))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Կատեգորիաները չբեռնվեցին։')
    } finally {
      setLoading(false)
    }
  }, [token])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      const saved = await api.saveCategory(token, draft)
      await load()
      setDraft({ ...saved })
      setSuccess('Կատեգորիան պահպանվել է։')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Կատեգորիան չպահպանվեց։')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!draft.id || !window.confirm('Ջնջե՞լ այս կատեգորիան։')) return
    try {
      await api.deleteCategory(token, draft.id)
      setDraft(emptyCategory())
      await load()
      setSuccess('Կատեգորիան ջնջվել է։')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Կատեգորիան չջնջվեց։')
    }
  }

  function setName(locale: 'hy' | 'en', value: string) {
    setDraft((current) => ({
      ...current,
      slug: locale === 'en' && !current.id && !current.slug ? slugify(value) : current.slug,
      translations: { ...current.translations, [locale]: { name: value } },
    }))
  }

  return (
    <>
      <AdminPageHeading eyebrow="ԿԱՏԱԼՈԳ" title="Կատեգորիաներ" action={<button className="admin-primary-button" onClick={() => { setDraft(emptyCategory()); setSuccess('') }}><Plus />Նոր կատեգորիա</button>} />
      <AdminError message={error} /><AdminSuccess message={success} />
      {loading && <AdminLoading />}
      {!loading && <div className="admin-editor-layout compact-list">
        <aside className="admin-record-list">
          {categories.length === 0 && <div className="admin-list-empty"><Tags />Կատեգորիաներ չկան</div>}
          {categories.map((category) => <button key={category.id} className={draft.id === category.id ? 'active' : ''} onClick={() => { setDraft({ ...category }); setSuccess('') }}><span>{category.translations.hy.name || category.translations.en.name}</span><small>{category.status}</small></button>)}
        </aside>
        <form className="admin-editor-main admin-form" onSubmit={save}>
          <div className="admin-editor-toolbar"><div><strong>{draft.id ? 'Խմբագրել կատեգորիան' : 'Նոր կատեգորիա'}</strong></div><div className="admin-toolbar-actions">{draft.id && <button type="button" className="admin-danger-button" onClick={() => void remove()}><Trash2 />Ջնջել</button>}<button className="admin-primary-button" disabled={saving}><Save />{saving ? 'Պահպանվում է…' : 'Պահպանել'}</button></div></div>
          <div className="admin-form-grid">
            <label><span>Հայերեն անվանում</span><input value={draft.translations.hy.name} onChange={(event) => setName('hy', event.target.value)} required /></label>
            <label><span>English name</span><input value={draft.translations.en.name} onChange={(event) => setName('en', event.target.value)} required /></label>
            <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} placeholder="circuit-breakers" required /></label>
            <label><span>Վիճակ</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Status })}><option value="draft">Սևագիր</option><option value="published">Հրապարակված</option><option value="archived">Արխիվ</option></select></label>
            <label><span>Ծնող կատեգորիա</span><select value={draft.parent_id ?? ''} onChange={(event) => setDraft({ ...draft, parent_id: event.target.value ? Number(event.target.value) : null })}><option value="">Չկա</option>{categories.filter((category) => category.id !== draft.id).map((category) => <option key={category.id} value={category.id}>{category.translations.hy.name}</option>)}</select></label>
            <label><span>Հերթականություն</span><input type="number" min="0" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })} /></label>
          </div>
        </form>
      </div>}
    </>
  )
}
