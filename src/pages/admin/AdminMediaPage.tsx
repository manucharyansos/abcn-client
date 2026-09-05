import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Copy, FileText, Images, Trash2, Upload } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { AdminContext } from '../../admin/AdminLayout'
import { AdminError, AdminLoading, AdminPageHeading, AdminSuccess, Pagination } from '../../admin/shared'
import { formatBytes } from '../../admin/utils'
import { api, type MediaAsset, type Paginated } from '../../api'

export function AdminMediaPage() {
  const { token } = useOutletContext<AdminContext>()
  const [data, setData] = useState<Paginated<MediaAsset> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = useCallback(async () => {
    try {
      setData(await api.getMedia(token, page))
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ֆայլերը չբեռնվեցին։')
    } finally {
      setLoading(false)
    }
  }, [page, token])

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { void load() }, [load])

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const file = form.get('file')
    if (!(file instanceof File) || !file.size) return
    setUploading(true)
    setSuccess('')
    try {
      await api.uploadMedia(token, file, { hy: String(form.get('alt_hy') ?? ''), en: String(form.get('alt_en') ?? '') })
      formElement.reset()
      setData(await api.getMedia(token, 1))
      setPage(1)
      setSuccess('Ֆայլը հաջողությամբ բեռնվել է։')
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ֆայլը չբեռնվեց։')
    } finally {
      setUploading(false)
    }
  }

  async function remove(media: MediaAsset) {
    if (!window.confirm(`Ջնջե՞լ ${media.original_name} ֆայլը։`)) return
    try {
      await api.deleteMedia(token, media.id)
      await load()
      setSuccess('Ֆայլը ջնջվել է։')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Ֆայլը չջնջվեց։')
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="MEDIA LIBRARY" title="Նկարներ և PDF-ներ" />
      <form className="admin-upload-panel" onSubmit={upload}>
        <label className="admin-file-drop"><Upload /><strong>Ընտրել նկար կամ PDF</strong><span>JPG, PNG, WebP կամ PDF · առավելագույնը 10 ՄԲ</span><input name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required /></label>
        <div className="admin-upload-fields">
          <label><span>Alt տեքստ՝ հայերեն</span><input name="alt_hy" placeholder="Նկարի կարճ նկարագրություն" /></label>
          <label><span>Alt text՝ English</span><input name="alt_en" placeholder="Short image description" /></label>
          <button className="admin-primary-button" disabled={uploading}><Upload />{uploading ? 'Բեռնվում է…' : 'Բեռնել'}</button>
        </div>
      </form>
      <AdminError message={error} /><AdminSuccess message={success} />
      {loading && <AdminLoading />}
      {data && <>
        {data.data.length ? <div className="admin-media-grid">
          {data.data.map((media) => <article key={media.id} className="admin-media-card">
            <div className="admin-media-preview">{media.kind === 'image' ? <img src={media.url} alt={media.alt?.hy || media.original_name} /> : <FileText />}</div>
            <div className="admin-media-info"><strong title={media.original_name}>{media.original_name}</strong><span>{formatBytes(media.size)} · {media.kind === 'image' ? 'Նկար' : 'PDF'}</span></div>
            <div className="admin-media-actions"><button title="Պատճենել հղումը" onClick={() => { void navigator.clipboard.writeText(media.url); setSuccess('Հղումը պատճենվել է։') }}><Copy /></button><button title="Ջնջել" onClick={() => void remove(media)}><Trash2 /></button></div>
          </article>)}
        </div> : <div className="admin-empty admin-panel"><Images /><h3>Ֆայլեր դեռ չկան</h3><p>Բեռնեք ապրանքների նկարները, կատալոգները կամ սերտիֆիկատները։</p></div>}
        <Pagination current={data.current_page} last={data.last_page} onChange={(next) => { setLoading(true); setPage(next) }} />
      </>}
    </>
  )
}
