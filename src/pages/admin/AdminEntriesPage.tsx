import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { BriefcaseBusiness, FolderKanban, Newspaper, Plus, Save, Trash2, Users } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { AssetPicker } from '../../admin/AssetPicker'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading, AdminSuccess } from '../../admin/shared'
import { slugify } from '../../admin/utils'
import { api, type EditorialEntry, type EditorialKind, type MediaAsset, type Status } from '../../api'

type EntryDraft = Omit<EditorialEntry, 'id' | 'updated_at'> & { id?: number }

const configs = {
  services: {
    eyebrow: 'ԾԱՌԱՅՈՒԹՅՈՒՆՆԵՐ',
    title: 'Ծառայություններ',
    singular: 'ծառայությունը',
    empty: 'Ծառայություններ դեռ չկան',
    icon: BriefcaseBusiness,
    dateField: null,
  },
  projects: {
    eyebrow: 'ՆԱԽԱԳԾԵՐ',
    title: 'Նախագծեր',
    singular: 'նախագիծը',
    empty: 'Նախագծեր դեռ չկան',
    icon: FolderKanban,
    dateField: 'completed_at',
  },
  news: {
    eyebrow: 'ՆՈՐՈՒԹՅՈՒՆՆԵՐ',
    title: 'Նորություններ',
    singular: 'նորությունը',
    empty: 'Նորություններ դեռ չկան',
    icon: Newspaper,
    dateField: 'published_at',
  },
  team: {
    eyebrow: 'ԹԻՄ',
    title: 'Թիմ',
    singular: 'թիմի անդամին',
    empty: 'Թիմի անդամներ դեռ չկան',
    icon: Users,
    dateField: null,
  },
} as const

function emptyEntry(): EntryDraft {
  return {
    slug: '', status: 'draft', show_on_homepage: false, sort_order: 0,
    translations: {
      hy: { title: '', summary: '', body: '' },
      en: { title: '', summary: '', body: '' },
    },
    images: [], completed_at: null, published_at: null,
  }
}

function normalizeEntry(entry: EditorialEntry): EntryDraft {
  return {
    id: entry.id,
    slug: entry.slug,
    status: entry.status,
    show_on_homepage: Boolean(entry.show_on_homepage),
    sort_order: entry.sort_order,
    translations: {
      hy: {
        title: entry.translations.hy?.title ?? '',
        summary: entry.translations.hy?.summary ?? '',
        body: entry.translations.hy?.body ?? '',
      },
      en: {
        title: entry.translations.en?.title ?? '',
        summary: entry.translations.en?.summary ?? '',
        body: entry.translations.en?.body ?? '',
      },
    },
    images: entry.images ?? [],
    completed_at: entry.completed_at?.slice(0, 10) ?? null,
    published_at: entry.published_at?.slice(0, 10) ?? null,
  }
}

export function AdminEntriesPage({ kind }: { kind: EditorialKind }) {
  const config = configs[kind]
  const EmptyIcon = config.icon
  const { token } = useOutletContext<AdminContext>()
  const [entries, setEntries] = useState<EditorialEntry[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [draft, setDraft] = useState<EntryDraft>(emptyEntry)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [entryData, mediaData] = await Promise.all([
        api.getEditorialEntries(token, kind),
        api.getMedia(token),
      ])
      setEntries(entryData)
      setMedia(mediaData.data)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Տվյալները չբեռնվեցին։')
    } finally {
      setLoading(false)
    }
  }, [kind, token])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setDraft(emptyEntry())
    void load()
  }, [load])

  function updateTranslation(locale: 'hy' | 'en', field: 'title' | 'summary' | 'body', value: string) {
    setDraft((current) => ({
      ...current,
      slug: locale === 'en' && field === 'title' && !current.id && !current.slug ? slugify(value) : current.slug,
      translations: {
        ...current.translations,
        [locale]: { ...current.translations[locale], [field]: value },
      },
    }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      const saved = await api.saveEditorialEntry(token, kind, draft)
      setDraft(normalizeEntry(saved))
      await load()
      setSuccess('Գրառումը պահպանվել է։')
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Գրառումը չպահպանվեց։')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!draft.id || !window.confirm(`Ջնջե՞լ այս ${config.singular}։`)) return
    try {
      await api.deleteEditorialEntry(token, kind, draft.id)
      setDraft(emptyEntry())
      await load()
      setSuccess('Գրառումը ջնջվել է։')
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Գրառումը չջնջվեց։')
    }
  }

  function moveImage(index: number, targetIndex: number) {
    setDraft((current) => {
      const images = [...(current.images ?? [])]
      if (!images[index] || targetIndex < 0 || targetIndex >= images.length) return current
      const [image] = images.splice(index, 1)
      images.splice(targetIndex, 0, image)
      return { ...current, images }
    })
  }

  const dateInput = config.dateField === 'completed_at'
    ? <label><span>Ավարտի ամսաթիվ</span><input type="date" value={draft.completed_at ?? ''} onChange={(event) => setDraft({ ...draft, completed_at: event.target.value || null })} /></label>
    : config.dateField === 'published_at'
      ? <label><span>Հրապարակման ամսաթիվ</span><input type="date" value={draft.published_at ?? ''} onChange={(event) => setDraft({ ...draft, published_at: event.target.value || null })} /></label>
      : null

  return (
    <>
      <AdminPageHeading
        eyebrow={config.eyebrow}
        title={config.title}
        action={<button className="admin-primary-button" onClick={() => { setDraft(emptyEntry()); setSuccess('') }}><Plus />Նոր գրառում</button>}
      />
      <AdminError message={error} /><AdminSuccess message={success} />
      {loading && <AdminLoading />}
      {!loading && <div className="admin-editor-layout">
        <aside className="admin-record-list">
          {entries.length === 0 && <div className="admin-list-empty"><EmptyIcon />{config.empty}</div>}
          {entries.map((entry) => <button
            type="button"
            key={entry.id}
            className={draft.id === entry.id ? 'active' : ''}
            onClick={() => { setDraft(normalizeEntry(entry)); setSuccess('') }}
          >
            <span>{entry.translations.hy?.title || entry.translations.en?.title}</span>
            <small>{entry.status}{entry.show_on_homepage ? ' · գլխավոր էջ' : ''}</small>
          </button>)}
        </aside>
        <form className="admin-editor-main admin-form" onSubmit={save}>
          <div className="admin-editor-toolbar">
            <div><strong>{draft.id ? 'Խմբագրել գրառումը' : 'Նոր գրառում'}</strong><span>{draft.slug ? `/${kind}/${draft.slug}` : 'Լրացրեք երկու լեզուներով'}</span></div>
            <div className="admin-toolbar-actions">
              {draft.id && <button type="button" className="admin-danger-button" onClick={() => void remove()}><Trash2 />Ջնջել</button>}
              <button className="admin-primary-button" disabled={saving}><Save />{saving ? 'Պահպանվում է…' : 'Պահպանել'}</button>
            </div>
          </div>
          <div className="admin-form-grid editorial-base-fields">
            <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} required /></label>
            <label><span>Վիճակ</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Status })}><option value="draft">Սևագիր</option><option value="published">Հրապարակված</option><option value="archived">Արխիվ</option></select></label>
            <label><span>Հերթականություն</span><input type="number" min="0" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })} /></label>
            {dateInput}
            {kind !== 'team' && <label className="admin-checkbox"><input type="checkbox" checked={draft.show_on_homepage} onChange={(event) => setDraft({ ...draft, show_on_homepage: event.target.checked })} /><span>Ցուցադրել գլխավոր էջում</span></label>}
          </div>
          <div className="admin-language-grid">
            {(['hy', 'en'] as const).map((locale) => <section className="admin-language-card" key={locale}>
              <div className="admin-language-title"><span>{locale.toUpperCase()}</span><h2>{locale === 'hy' ? 'Հայերեն' : 'English'}</h2></div>
              <label><span>{kind === 'team' ? 'Անուն, ազգանուն' : 'Վերնագիր'}</span><input value={draft.translations[locale].title} onChange={(event) => updateTranslation(locale, 'title', event.target.value)} required /></label>
              <label><span>{kind === 'team' ? 'Պաշտոն / մասնագիտացում' : 'Կարճ նկարագրություն'}</span><textarea rows={4} value={draft.translations[locale].summary ?? ''} onChange={(event) => updateTranslation(locale, 'summary', event.target.value)} /></label>
              {kind !== 'team' && <label><span>Ամբողջական տեքստ</span><textarea rows={10} value={draft.translations[locale].body ?? ''} onChange={(event) => updateTranslation(locale, 'body', event.target.value)} /></label>}
            </section>)}
          </div>
          <AssetPicker
            label={kind === 'team' ? "Անդամի նկար" : "Նկարներ"}
            assets={draft.images ?? []}
            media={media}
            kind="image"
            maxItems={kind === 'team' ? 1 : 4}
            onAdd={(asset) => setDraft((current) => ({ ...current, images: [...(current.images ?? []), asset].slice(0, kind === 'team' ? 1 : 4) }))}
            onMove={moveImage}
            onRemove={(index) => setDraft((current) => ({ ...current, images: (current.images ?? []).filter((_, itemIndex) => itemIndex !== index) }))}
          />
        </form>
      </div>}
    </>
  )
}
