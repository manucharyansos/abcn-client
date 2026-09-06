import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, FileText, Image, PackageSearch, Plus, Save, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading, AdminSuccess, Pagination } from '../../admin/shared'
import { slugify } from '../../admin/utils'
import { api, type MediaAsset, type Paginated, type Product, type ProductAsset, type ProductCategory, type ProductFilterAttribute, type Status } from '../../api'

type ProductDraft = Omit<Product, 'id' | 'updated_at' | 'category'> & { id?: number }

const emptyProduct = (): ProductDraft => ({
  product_category_id: null, slug: '', sku: '', status: 'draft', featured: false, sort_order: 0,
  translations: { hy: { name: '', description: '' }, en: { name: '', description: '' } },
  specifications: { hy: {}, en: {} }, filter_attributes: [], images: [], documents: [],
})

function normalizeProduct(product: Product): ProductDraft {
  return {
    id: product.id,
    product_category_id: product.product_category_id,
    slug: product.slug,
    sku: product.sku ?? '',
    status: product.status,
    featured: product.featured,
    sort_order: product.sort_order,
    translations: {
      hy: { name: product.translations.hy?.name ?? '', description: product.translations.hy?.description ?? '' },
      en: { name: product.translations.en?.name ?? '', description: product.translations.en?.description ?? '' },
    },
    specifications: { hy: product.specifications?.hy ?? {}, en: product.specifications?.en ?? {} },
    filter_attributes: product.filter_attributes ?? [],
    images: product.images ?? [],
    documents: product.documents ?? [],
  }
}

function specsToText(specs: Record<string, string> | undefined) {
  return Object.entries(specs ?? {}).map(([key, value]) => `${key}: ${value}`).join('\n')
}

function textToSpecs(value: string) {
  return Object.fromEntries(value.split('\n').map((line) => {
    const separator = line.indexOf(':')
    return separator > 0 ? [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] : null
  }).filter((line): line is [string, string] => Boolean(line?.[0])))
}

function mediaToAsset(media: MediaAsset): ProductAsset {
  return { url: media.url, name: media.original_name, alt: media.alt ?? undefined }
}

function emptyFilterAttribute(sortOrder: number): ProductFilterAttribute {
  return {
    key: '', option: '', sort_order: sortOrder,
    label: { hy: '', en: '' }, value: { hy: '', en: '' },
  }
}

function AssetPicker({ label, icon: Icon, assets, media, kind, maxItems, onAdd, onMove, onRemove }: {
  label: string
  icon: typeof Image
  assets: ProductAsset[]
  media: MediaAsset[]
  kind: MediaAsset['kind']
  maxItems?: number
  onAdd: (asset: ProductAsset) => void
  onMove?: (index: number, targetIndex: number) => void
  onRemove: (index: number) => void
}) {
  const limitReached = maxItems !== undefined && assets.length >= maxItems

  return (
    <div className="admin-assets-field">
      <div className="admin-assets-heading"><span>{label}{maxItems ? <small>{assets.length}/{maxItems}</small> : null}</span><select disabled={limitReached} value="" onChange={(event) => { const selected = media.find((item) => item.id === Number(event.target.value)); if (selected) onAdd(mediaToAsset(selected)) }}><option value="">{limitReached ? `Առավելագույնը ${maxItems} նկար` : 'Ավելացնել ֆայլերից…'}</option>{media.filter((item) => item.kind === kind && !assets.some((asset) => asset.url === item.url)).map((item) => <option key={item.id} value={item.id}>{item.original_name}</option>)}</select></div>
      {assets.length ? <div className="admin-selected-assets">{assets.map((asset, index) => <div key={`${asset.url}-${index}`}>{kind === 'image' ? <img src={asset.url} alt="" /> : <FileText />}<span>{kind === 'image' && index === 0 ? 'Գլխավոր · ' : ''}{asset.name ?? asset.url}</span><div className="admin-asset-actions">{onMove ? <><button type="button" disabled={index === 0} title="Տեղափոխել վերև" onClick={() => onMove(index, index - 1)}><ChevronUp /></button><button type="button" disabled={index === assets.length - 1} title="Տեղափոխել ներքև" onClick={() => onMove(index, index + 1)}><ChevronDown /></button></> : null}<button type="button" title="Հեռացնել" onClick={() => onRemove(index)}><X /></button></div></div>)}</div> : <div className="admin-assets-empty"><Icon />Ընտրված ֆայլ չկա։ <Link to="/admin/media">Բեռնել ֆայլ</Link></div>}
    </div>
  )
}

export function AdminProductsPage() {
  const { token } = useOutletContext<AdminContext>()
  const [products, setProducts] = useState<Paginated<Product> | null>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      setProducts(await api.getProducts(token, { page, status, category: category ? Number(category) : undefined, search: query }))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ապրանքները չբեռնվեցին։')
    } finally {
      setLoading(false)
    }
  }, [category, page, query, status, token])

  const loadResources = useCallback(async () => {
    try {
      const [categoryData, mediaData] = await Promise.all([api.getCategories(token), api.getMedia(token)])
      setCategories(categoryData)
      setMedia(mediaData.data)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Կատալոգի տվյալները չբեռնվեցին։')
    }
  }, [token])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void loadProducts() }, [loadProducts])
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void loadResources() }, [loadResources])

  function setTranslation(locale: 'hy' | 'en', field: 'name' | 'description', value: string) {
    setDraft((current) => ({
      ...current,
      slug: locale === 'en' && field === 'name' && !current.id && !current.slug ? slugify(value) : current.slug,
      translations: { ...current.translations, [locale]: { ...current.translations[locale], [field]: value } },
    }))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setSuccess('')
    try {
      const filterAttributes = (draft.filter_attributes ?? []).map((attribute, index) => ({
        ...attribute,
        key: slugify(attribute.key || attribute.label.en),
        option: slugify(attribute.value.en),
        sort_order: index,
      }))
      const saved = await api.saveProduct(token, { ...draft, filter_attributes: filterAttributes })
      setDraft(normalizeProduct(saved))
      await loadProducts()
      setSuccess('Ապրանքը պահպանվել է։')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ապրանքը չպահպանվեց։')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!draft.id || !window.confirm('Ջնջե՞լ այս ապրանքը։')) return
    try {
      await api.deleteProduct(token, draft.id)
      setDraft(emptyProduct())
      await loadProducts()
      setSuccess('Ապրանքը ջնջվել է։')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ապրանքը չջնջվեց։')
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    setPage(1)
    setQuery(search.trim())
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

  function updateFilterAttribute(index: number, update: (attribute: ProductFilterAttribute) => ProductFilterAttribute) {
    setDraft((current) => ({
      ...current,
      filter_attributes: (current.filter_attributes ?? []).map((attribute, attributeIndex) => attributeIndex === index ? update(attribute) : attribute),
    }))
  }

  return (
    <>
      <AdminPageHeading eyebrow="ԿԱՏԱԼՈԳ" title="Ապրանքներ" action={<button className="admin-primary-button" onClick={() => { setDraft(emptyProduct()); setSuccess('') }}><Plus />Նոր ապրանք</button>} />
      <form className="admin-filters" onSubmit={submitSearch}>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Անվանում, SKU կամ slug" />
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}><option value="">Բոլոր կատեգորիաները</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.translations.hy.name}</option>)}</select>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="">Բոլոր վիճակները</option><option value="draft">Սևագիր</option><option value="published">Հրապարակված</option><option value="archived">Արխիվ</option></select>
        <button className="admin-secondary-button">Փնտրել</button>
      </form>
      <AdminError message={error} /><AdminSuccess message={success} />
      {loading && <AdminLoading />}
      {!loading && <div className="admin-editor-layout product-editor-layout">
        <aside className="admin-record-list">
          {!products?.data.length && <div className="admin-list-empty"><PackageSearch />Ապրանքներ չկան</div>}
          {products?.data.map((product) => <button key={product.id} className={draft.id === product.id ? 'active' : ''} onClick={() => { setDraft(normalizeProduct(product)); setSuccess('') }}><span>{product.translations.hy.name || product.translations.en.name}</span><small>{product.sku || product.status}</small></button>)}
          {products && <Pagination current={products.current_page} last={products.last_page} onChange={setPage} />}
        </aside>
        <form className="admin-editor-main admin-form" onSubmit={save}>
          <div className="admin-editor-toolbar"><div><strong>{draft.id ? 'Խմբագրել ապրանքը' : 'Նոր ապրանք'}</strong></div><div className="admin-toolbar-actions">{draft.id && <button type="button" className="admin-danger-button" onClick={() => void remove()}><Trash2 />Ջնջել</button>}<button className="admin-primary-button" disabled={saving}><Save />{saving ? 'Պահպանվում է…' : 'Պահպանել'}</button></div></div>
          <div className="admin-form-grid product-base-fields">
            <label><span>Կատեգորիա</span><select value={draft.product_category_id ?? ''} onChange={(event) => setDraft({ ...draft, product_category_id: event.target.value ? Number(event.target.value) : null })}><option value="">Չընտրված</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.translations.hy.name}</option>)}</select></label>
            <label><span>SKU / կոդ</span><input value={draft.sku ?? ''} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} /></label>
            <label><span>Slug</span><input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: slugify(event.target.value) })} required /></label>
            <label><span>Վիճակ</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Status })}><option value="draft">Սևագիր</option><option value="published">Հրապարակված</option><option value="archived">Արխիվ</option></select></label>
            <label><span>Հերթականություն</span><input type="number" min="0" value={draft.sort_order} onChange={(event) => setDraft({ ...draft, sort_order: Number(event.target.value) })} /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /><span>Ցուցադրել որպես ընտրված ապրանք</span></label>
          </div>
          <div className="admin-language-grid">
            {(['hy', 'en'] as const).map((locale) => <section className="admin-language-card" key={locale}>
              <div className="admin-language-title"><span>{locale.toUpperCase()}</span><h2>{locale === 'hy' ? 'Հայերեն' : 'English'}</h2></div>
              <label><span>Անվանում</span><input value={draft.translations[locale].name} onChange={(event) => setTranslation(locale, 'name', event.target.value)} required /></label>
              <label><span>Նկարագրություն</span><textarea rows={6} value={draft.translations[locale].description ?? ''} onChange={(event) => setTranslation(locale, 'description', event.target.value)} /></label>
              <label><span>Բնութագրեր՝ մեկ տողով «Անվանում: արժեք»</span><textarea rows={7} value={specsToText(draft.specifications?.[locale])} onChange={(event) => setDraft({ ...draft, specifications: { ...draft.specifications, [locale]: textToSpecs(event.target.value) } })} placeholder={locale === 'hy' ? 'Լարում: 230 V\nՀոսանք: 16 A' : 'Voltage: 230 V\nCurrent: 16 A'} /></label>
            </section>)}
          </div>
          <section className="admin-filter-editor">
            <div className="admin-filter-heading">
              <div><SlidersHorizontal /><div><strong>Կատալոգի տեխնիկական ֆիլտրեր</strong><p>Ավելացրեք միայն այն հատկանիշները, որոնցով հաճախորդը պետք է կարողանա ֆիլտրել ապրանքները։</p></div></div>
              <button type="button" className="admin-secondary-button" onClick={() => setDraft((current) => ({ ...current, filter_attributes: [...(current.filter_attributes ?? []), emptyFilterAttribute(current.filter_attributes?.length ?? 0)] }))}><Plus />Ավելացնել ֆիլտր</button>
            </div>
            {(draft.filter_attributes ?? []).length ? <div className="admin-filter-list">{(draft.filter_attributes ?? []).map((attribute, index) => <article className="admin-filter-row" key={`${attribute.id ?? 'new'}-${index}`}>
              <div className="admin-filter-row-top">
                <label><span>Խմբի կոդ</span><input value={attribute.key} onChange={(event) => updateFilterAttribute(index, (current) => ({ ...current, key: slugify(event.target.value) }))} placeholder="rated-current" required /></label>
                <button type="button" className="admin-icon-danger" title="Հեռացնել ֆիլտրը" onClick={() => setDraft((current) => ({ ...current, filter_attributes: (current.filter_attributes ?? []).filter((_, attributeIndex) => attributeIndex !== index) }))}><Trash2 /></button>
              </div>
              <div className="admin-filter-locales">
                {(['hy', 'en'] as const).map((filterLocale) => <div key={filterLocale}>
                  <span>{filterLocale.toUpperCase()}</span>
                  <label><span>Ֆիլտրի անվանում</span><input value={attribute.label[filterLocale]} onChange={(event) => updateFilterAttribute(index, (current) => ({ ...current, label: { ...current.label, [filterLocale]: event.target.value } }))} placeholder={filterLocale === 'hy' ? 'Նոմինալ հոսանք' : 'Rated current'} required /></label>
                  <label><span>Այս ապրանքի արժեք</span><input value={attribute.value[filterLocale]} onChange={(event) => updateFilterAttribute(index, (current) => ({ ...current, value: { ...current.value, [filterLocale]: event.target.value } }))} placeholder="16 A" required /></label>
                </div>)}
              </div>
            </article>)}</div> : <div className="admin-filter-empty"><SlidersHorizontal /><span>Այս ապրանքի համար տեխնիկական ֆիլտր դեռ ավելացված չէ։</span></div>}
          </section>
          <AssetPicker label="Ապրանքի նկարներ" icon={Image} assets={draft.images ?? []} media={media} kind="image" maxItems={4} onAdd={(asset) => setDraft((current) => ({ ...current, images: [...(current.images ?? []), asset].slice(0, 4) }))} onMove={moveImage} onRemove={(index) => setDraft((current) => ({ ...current, images: (current.images ?? []).filter((_, itemIndex) => itemIndex !== index) }))} />
          <AssetPicker label="PDF փաստաթղթեր" icon={FileText} assets={draft.documents ?? []} media={media} kind="document" onAdd={(asset) => setDraft({ ...draft, documents: [...(draft.documents ?? []), asset] })} onRemove={(index) => setDraft({ ...draft, documents: (draft.documents ?? []).filter((_, itemIndex) => itemIndex !== index) })} />
        </form>
      </div>}
    </>
  )
}
