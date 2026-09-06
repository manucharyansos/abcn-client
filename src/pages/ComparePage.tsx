import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, LoaderCircle, PackageSearch, Scale, Trash2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { api, type Product } from '../api'
import type { Locale, SiteCopy } from '../content'
import { useProductComparison } from '../productComparison'

function localizedProduct(product: Product, locale: Locale) {
  return product.translations[locale] ?? product.translations.en
}

function categoryName(product: Product, locale: Locale) {
  return product.category?.translations?.[locale]?.name || product.category?.translations?.en.name || '—'
}

function productImage(product: Product) {
  return product.images?.[0]
}

export function ComparePage({ locale }: { copy: SiteCopy; locale: Locale }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { slugs: storedSlugs, limit, replace, clear } = useProductComparison()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const queryValue = searchParams.get('products') ?? ''
  const querySlugs = useMemo(
    () => [...new Set(queryValue.split(',').map((slug) => slug.trim()).filter(Boolean))].slice(0, limit),
    [limit, queryValue],
  )
  const activeSlugs = querySlugs.length ? querySlugs : storedSlugs
  const activeKey = activeSlugs.join(',')
  const storedKey = storedSlugs.join(',')
  const canCompare = activeSlugs.length >= 2

  useEffect(() => {
    document.title = `${locale === 'hy' ? 'Ապրանքների համեմատում' : 'Product comparison'} | ABCN`
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = locale === 'hy'
      ? 'Համեմատեք ABCN ապրանքների տեխնիկական բնութագրերը և ընտրեք համապատասխան լուծումը։'
      : 'Compare ABCN product specifications and choose the right solution.'
  }, [locale])

  useEffect(() => {
    if (querySlugs.length && activeKey !== storedKey) replace(querySlugs)
  }, [activeKey, querySlugs, replace, storedKey])

  useEffect(() => {
    if (!canCompare) return

    let active = true
    // oxlint-disable-next-line react/set-state-in-effect
    setLoading(true)
    setError(false)
    api.getProductComparison(activeKey.split(',')).then((result) => {
      if (active) setProducts(result)
    }).catch(() => {
      if (active) {
        setProducts([])
        setError(true)
      }
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [activeKey, canCompare])

  function removeProduct(slug: string) {
    const next = activeSlugs.filter((item) => item !== slug)
    replace(next)
    setSearchParams(next.length ? { products: next.join(',') } : {}, { replace: true })
  }

  const specificationKeys = [...new Set(products.flatMap((product) => Object.keys(product.specifications?.[locale] ?? product.specifications?.en ?? {})))]

  return <>
    <section className="page-hero compare-hero">
      <div className="page-hero-grid" aria-hidden="true" />
      <div className="container page-hero-inner">
        <p className="eyebrow"><span />{locale === 'hy' ? 'ՃԻՇՏ ԸՆՏՐՈՒԹՅՈՒՆ' : 'MAKE THE RIGHT CHOICE'}</p>
        <h1>{locale === 'hy' ? 'Ապրանքների համեմատում' : 'Product comparison'}</h1>
        <p>{locale === 'hy' ? 'Տեխնիկական տվյալները կողք կողքի՝ արագ և վստահ ընտրության համար։' : 'Technical data side by side for a faster, more confident choice.'}</p>
      </div>
    </section>
    <section className="section comparison-page">
      <div className="container">
        <Link className="comparison-back" to="/products"><ArrowLeft />{locale === 'hy' ? 'Վերադառնալ կատալոգ' : 'Back to catalog'}</Link>
        {activeSlugs.length < 2 ? <div className="comparison-empty">
          <Scale />
          <h2>{locale === 'hy' ? 'Ընտրեք առնվազն երկու ապրանք' : 'Select at least two products'}</h2>
          <p>{locale === 'hy' ? 'Կատալոգում նշեք համեմատման ենթակա 2–4 ապրանք։' : 'Choose 2–4 products to compare in the catalog.'}</p>
          <Link className="button button-primary dark-button" to="/products">{locale === 'hy' ? 'Բացել կատալոգը' : 'Open catalog'}<ArrowRight /></Link>
        </div> : loading ? <div className="catalog-loading" role="status"><LoaderCircle />{locale === 'hy' ? 'Համեմատությունը բեռնվում է…' : 'Loading comparison…'}</div> : error ? <div className="comparison-empty" role="alert">
          <PackageSearch />
          <h2>{locale === 'hy' ? 'Համեմատությունը չբեռնվեց' : 'Comparison could not be loaded'}</h2>
          <p>{locale === 'hy' ? 'Ապրանքներից մեկը կարող է այլևս հասանելի չլինել։ Մաքրեք ընտրությունը և փորձեք նորից։' : 'One of the products may no longer be available. Clear the selection and try again.'}</p>
          <button className="button button-outline-blue" type="button" onClick={() => { clear(); setSearchParams({}, { replace: true }) }}>{locale === 'hy' ? 'Մաքրել ընտրությունը' : 'Clear selection'}</button>
        </div> : <div className="comparison-table-scroll">
          <table className="comparison-table">
            <thead><tr>
              <th scope="col">{locale === 'hy' ? 'Բնութագիր' : 'Feature'}</th>
              {products.map((product) => {
                const translation = localizedProduct(product, locale)
                const image = productImage(product)
                return <th scope="col" key={product.id}>
                  <button className="comparison-remove" type="button" onClick={() => removeProduct(product.slug)} aria-label={`${locale === 'hy' ? 'Հեռացնել' : 'Remove'} ${translation.name}`}><Trash2 /></button>
                  <Link className="comparison-product" to={`/products/${product.slug}`}>
                    <span className="comparison-product-image">{image ? <img src={image.url} alt={image.alt?.[locale] || translation.name} /> : <PackageSearch />}</span>
                    <small>{product.sku || categoryName(product, locale)}</small>
                    <strong>{translation.name}</strong>
                  </Link>
                  <Link className="comparison-quote" to={`/contact?product=${encodeURIComponent(product.slug)}`}>{locale === 'hy' ? 'Ստանալ առաջարկ' : 'Request a quote'}<ArrowRight /></Link>
                </th>
              })}
            </tr></thead>
            <tbody>
              <tr><th scope="row">{locale === 'hy' ? 'Կատեգորիա' : 'Category'}</th>{products.map((product) => <td key={product.id}>{categoryName(product, locale)}</td>)}</tr>
              <tr><th scope="row">SKU</th>{products.map((product) => <td key={product.id}>{product.sku || '—'}</td>)}</tr>
              {specificationKeys.map((key) => <tr key={key}><th scope="row">{key}</th>{products.map((product) => <td key={product.id}>{(product.specifications?.[locale] ?? product.specifications?.en ?? {})[key] || '—'}</td>)}</tr>)}
            </tbody>
          </table>
        </div>}
        {!loading && !error && products.length >= 2 && specificationKeys.length === 0 ? <p className="comparison-no-specs">{locale === 'hy' ? 'Այս ապրանքների տեխնիկական տվյալները դեռ պատրաստվում են։' : 'Technical data for these products is still being prepared.'}</p> : null}
      </div>
    </section>
  </>
}
