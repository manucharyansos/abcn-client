import { ChevronDown, ChevronUp, FileText, Image, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MediaAsset, ProductAsset } from '../api'

function mediaToAsset(media: MediaAsset): ProductAsset {
  return { url: media.url, name: media.original_name, alt: media.alt ?? undefined }
}

export function AssetPicker({ label, assets, media, kind, maxItems, onAdd, onMove, onRemove }: {
  label: string
  assets: ProductAsset[]
  media: MediaAsset[]
  kind: MediaAsset['kind']
  maxItems?: number
  onAdd: (asset: ProductAsset) => void
  onMove?: (index: number, targetIndex: number) => void
  onRemove: (index: number) => void
}) {
  const limitReached = maxItems !== undefined && assets.length >= maxItems
  const EmptyIcon = kind === 'image' ? Image : FileText

  return (
    <div className="admin-assets-field">
      <div className="admin-assets-heading">
        <span>{label}{maxItems ? <small>{assets.length}/{maxItems}</small> : null}</span>
        <select
          disabled={limitReached}
          value=""
          onChange={(event) => {
            const selected = media.find((item) => item.id === Number(event.target.value))
            if (selected) onAdd(mediaToAsset(selected))
          }}
        >
          <option value="">{limitReached ? `Առավելագույնը ${maxItems} նկար` : 'Ավելացնել ֆայլերից…'}</option>
          {media
            .filter((item) => item.kind === kind && !assets.some((asset) => asset.url === item.url))
            .map((item) => <option key={item.id} value={item.id}>{item.original_name}</option>)}
        </select>
      </div>
      {assets.length ? <div className="admin-selected-assets">
        {assets.map((asset, index) => <div key={`${asset.url}-${index}`}>
          {kind === 'image' ? <img src={asset.url} alt="" /> : <FileText />}
          <span>{kind === 'image' && index === 0 ? 'Գլխավոր · ' : ''}{asset.name ?? asset.url}</span>
          <div className="admin-asset-actions">
            {onMove ? <>
              <button type="button" disabled={index === 0} title="Տեղափոխել վերև" onClick={() => onMove(index, index - 1)}><ChevronUp /></button>
              <button type="button" disabled={index === assets.length - 1} title="Տեղափոխել ներքև" onClick={() => onMove(index, index + 1)}><ChevronDown /></button>
            </> : null}
            <button type="button" title="Հեռացնել" onClick={() => onRemove(index)}><X /></button>
          </div>
        </div>)}
      </div> : <div className="admin-assets-empty"><EmptyIcon />Ընտրված ֆայլ չկա։ <Link to="/admin/media">Բեռնել ֆայլ</Link></div>}
    </div>
  )
}
