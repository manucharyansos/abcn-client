import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { FileStack, Save } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading, AdminSuccess } from '../../admin/shared'
import { api, type AdminPage, type PageLocaleContent, type PageMeta } from '../../api'
import { managedPageNames, normalizeManagedPageContent } from '../../pageContent'

const emptyMeta: PageMeta = { title: '', description: '' }

const labels: Record<string, string> = {
  nav: 'Մենյու',
  hero: 'Գլխավոր բլոկ',
  intro: 'Ներածական բլոկ',
  directions: 'Ուղղություններ',
  process: 'Աշխատանքի ընթացք',
  productsTeaser: 'Կատալոգի բլոկ',
  homeContent: 'Գլխավոր էջի բաժիններ',
  solutionsPage: 'Լուծումներ',
  servicesPage: 'Ծառայություններ',
  projectsPage: 'Նախագծեր',
  productsPage: 'Ապրանքներ',
  newsPage: 'Նորություններ',
  cta: 'Վերջնական կոչ',
  footer: 'Footer',
  directContacts: 'Ուղիղ կոնտակտներ',
  items: 'Տարրեր',
  principles: 'Սկզբունքներ',
  features: 'Առավելություններ',
  eyebrow: 'Փոքր վերնագիր',
  title: 'Վերնագիր',
  lead: 'Ներածական տեքստ',
  body: 'Տեքստ',
  storyTitle: 'Պատմության վերնագիր',
  story: 'Պատմության տեքստ',
  principlesTitle: 'Սկզբունքների վերնագիր',
  teamTitle: 'Թիմի վերնագիր',
  listEyebrow: 'Ցանկի փոքր վերնագիր',
  listTitle: 'Ցանկի վերնագիր',
  productsEyebrow: 'Ապրանքների փոքր վերնագիր',
  productsTitle: 'Ապրանքների վերնագիր',
  productsAction: 'Ապրանքների կոճակ',
  empty: 'Դատարկ վիճակի տեքստ',
  view: 'Դիտելու կոճակ',
  status: 'Կատալոգի կարգավիճակի տեքստ',
  action: 'Կոճակի տեքստ',
  noteTitle: 'Նշման վերնագիր',
  note: 'Նշման տեքստ',
  primary: 'Գլխավոր կոճակ',
  secondary: 'Երկրորդ կոճակ',
  link: 'Հղման տեքստ',
  servicesEyebrow: 'Ծառայությունների փոքր վերնագիր',
  servicesTitle: 'Ծառայությունների վերնագիր',
  servicesAction: 'Ծառայությունների հղում',
  projectsEyebrow: 'Նախագծերի փոքր վերնագիր',
  projectsTitle: 'Նախագծերի վերնագիր',
  projectsAction: 'Նախագծերի հղում',
  newsEyebrow: 'Նորությունների փոքր վերնագիր',
  newsTitle: 'Նորությունների վերնագիր',
  newsAction: 'Նորությունների հղում',
  readMore: 'Կարդալ ավելին',
  formTitle: 'Ձևի վերնագիր',
  name: 'Անվան դաշտ',
  email: 'Էլ․ փոստ',
  phone: 'Հեռախոս',
  address: 'Հասցե',
  company: 'Ընկերություն',
  message: 'Հաղորդագրության դաշտ',
  submit: 'Ուղարկել կոճակ',
  sending: 'Ուղարկման տեքստ',
  success: 'Հաջողության հաղորդագրություն',
  error: 'Սխալի հաղորդագրություն',
  details: 'Կոնտակտների վերնագիր',
  leadership: 'Ուղիղ կապերի վերնագիր',
  legalName: 'Իրավաբանական անվանում',
  role: 'Պաշտոն',
  line: 'Footer-ի տեքստ',
  rights: 'Իրավունքների տեքստ',
  home: 'Գլխավոր',
  about: 'Մեր մասին',
  contact: 'Կապ',
  project: 'Header կոճակ',
  menu: 'Բացել մենյուն',
  close: 'Փակել մենյուն',
  label: 'Մենյուի անվանում',
  skip: 'Անցնել բովանդակությանը',
}

function labelFor(key: string, index?: number) {
  if (/^\d+$/.test(key)) return `Տարր ${Number(key) + 1}`
  return labels[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2')
}

function normalizePage(page: AdminPage): AdminPage {
  return {
    ...page,
    content: {
      hy: normalizeManagedPageContent(page.slug, 'hy', page.content.hy) as PageLocaleContent,
      en: normalizeManagedPageContent(page.slug, 'en', page.content.en) as PageLocaleContent,
    },
    meta: {
      hy: { ...emptyMeta, ...page.meta?.hy },
      en: { ...emptyMeta, ...page.meta?.en },
    },
  }
}

function setAtPath(root: PageLocaleContent, path: (string | number)[], value: string): PageLocaleContent {
  const next = JSON.parse(JSON.stringify(root)) as Record<string, unknown>
  let cursor: unknown = next

  path.forEach((part, index) => {
    const isLast = index === path.length - 1
    if (Array.isArray(cursor)) {
      const numericPart = Number(part)
      if (isLast) cursor[numericPart] = value
      else cursor = cursor[numericPart]
      return
    }

    if (cursor && typeof cursor === 'object') {
      const record = cursor as Record<string, unknown>
      const key = String(part)
      if (isLast) record[key] = value
      else cursor = record[key]
    }
  })

  return next as PageLocaleContent
}

function shouldUseTextarea(key: string, value: string) {
  return value.length > 90 || /(body|lead|text|description|story|note|summary|error|success)/i.test(key)
}

function ContentTree({ value, path = [], onChange }: {
  value: unknown
  path?: (string | number)[]
  onChange: (path: (string | number)[], value: string) => void
}) {
  const currentKey = String(path[path.length - 1] ?? '')

  if (typeof value === 'string') {
    const label = labelFor(currentKey)
    return <label className="admin-content-field">
      <span>{label}</span>
      {shouldUseTextarea(currentKey, value)
        ? <textarea rows={4} value={value} onChange={(event) => onChange(path, event.target.value)} />
        : <input value={value} onChange={(event) => onChange(path, event.target.value)} />}
    </label>
  }

  if (Array.isArray(value)) {
    return <div className="admin-content-group admin-content-array">
      {path.length ? <h3>{labelFor(currentKey)}</h3> : null}
      {value.map((item, index) => <div className="admin-content-array-item" key={index}>
        <strong>{`Տարր ${index + 1}`}</strong>
        <ContentTree value={item} path={[...path, index]} onChange={onChange} />
      </div>)}
    </div>
  }

  if (value && typeof value === 'object') {
    return <div className="admin-content-group">
      {path.length ? <h3>{labelFor(currentKey)}</h3> : null}
      <div className="admin-content-fields">
        {Object.entries(value as Record<string, unknown>).map(([key, child]) => (
          <ContentTree key={key} value={child} path={[...path, key]} onChange={onChange} />
        ))}
      </div>
    </div>
  }

  return null
}

function LocaleEditor({ locale, label, page, onChange, onMeta }: {
  locale: 'hy' | 'en'
  label: string
  page: AdminPage
  onChange: (path: (string | number)[], value: string) => void
  onMeta: (key: keyof PageMeta, value: string) => void
}) {
  const pageContent = page.content[locale] as PageLocaleContent
  const meta = page.meta?.[locale] as PageMeta

  return (
    <section className="admin-language-card">
      <div className="admin-language-title"><span>{locale.toUpperCase()}</span><h2>{label}</h2></div>
      <ContentTree value={pageContent} onChange={onChange} />
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

  function updateContent(locale: 'hy' | 'en', path: (string | number)[], value: string) {
    setSelected((current) => current ? {
      ...current,
      content: {
        ...current.content,
        [locale]: setAtPath(current.content[locale], path, value),
      },
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
      setSuccess('Էջի ամբողջ բովանդակությունը պահպանվել է։')
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Փոփոխությունները չպահպանվեցին։')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="ԿԱՅՔԻ ԷՋԵՐ" title="Ամբողջ բովանդակություն" />
      <AdminError message={error} /><AdminSuccess message={success} />
      {loading && <AdminLoading />}
      {!loading && pages.length === 0 && <div className="admin-empty admin-panel"><FileStack /><h3>Էջեր չկան</h3><p>API-ում գործարկեք database seeder-ը։</p></div>}
      {selected && <form className="admin-editor-layout" onSubmit={save}>
        <aside className="admin-record-list">
          {pages.map((page) => <button type="button" key={page.id} className={selected.id === page.id ? 'active' : ''} onClick={() => { setSelected(normalizePage(page)); setSuccess('') }}><span>{managedPageNames[page.slug] ?? page.slug}</span><small>{page.status}</small></button>)}
        </aside>
        <div className="admin-editor-main">
          <div className="admin-editor-toolbar">
            <div><strong>{managedPageNames[selected.slug] ?? selected.slug}</strong><span>/{selected.slug}</span></div>
            <label><span>Վիճակ</span><select value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value as AdminPage['status'] })}><option value="draft">Սևագիր</option><option value="published">Հրապարակված</option><option value="archived">Արխիվ</option></select></label>
            <button className="admin-primary-button" disabled={saving}><Save />{saving ? 'Պահպանվում է…' : 'Պահպանել'}</button>
          </div>
          <div className="admin-language-grid">
            <LocaleEditor locale="hy" label="Հայերեն" page={selected} onChange={(path, value) => updateContent('hy', path, value)} onMeta={(key, value) => updateMeta('hy', key, value)} />
            <LocaleEditor locale="en" label="English" page={selected} onChange={(path, value) => updateContent('en', path, value)} onMeta={(key, value) => updateMeta('en', key, value)} />
          </div>
        </div>
      </form>}
    </>
  )
}
