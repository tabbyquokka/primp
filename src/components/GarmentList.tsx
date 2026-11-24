import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Garment, Layer } from '../types'
import { LAYER_LABELS } from '../types'
import { GarmentForm } from './GarmentForm'
import { Modal } from './Modal'

export function GarmentList() {
    const layers: Layer[] = ['top', 'middle', 'base', 'shoes', 'accessories']
    return (
    <div className="space-y-6">
      {layers.map((layer) => (
        <GarmentSection key={layer} layer={layer} />
      ))}
    </div>
  )
}

function GarmentSection({ layer }: { layer: Layer }) {
  const items = useLiveQuery(
    () => db.garments.where('layer').equals(layer).sortBy('createdAt'),
    [layer]
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Garment | undefined>(undefined)

  async function handleSave(g: Garment) {
    await db.garments.put(g)
    setFormOpen(false)
    setEditing(undefined)
  }

  async function handleDelete(g: Garment) {
    if (!confirm(`Удалить «${g.title}»?`)) return
    await db.garments.delete(g.id)
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-slate-900">{LAYER_LABELS[layer]}</h2>
        <button
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
          className="text-sm font-medium text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100"
        >
          + Добавить
        </button>
      </div>

      {items === undefined ? (
        <p className="text-sm text-slate-400">Загрузка…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">Пока пусто</p>
      ) : (
        <ul className="space-y-2">
          {items.map((g) => (
            <li
              key={g.id}
              className="bg-white rounded-xl border border-slate-200 p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate">{g.title}</p>
                {layer === 'top' && <TopDetails g={g} />}
                {g.link && (
                  <a
                    href={g.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 truncate block mt-1"
                  >
                    {g.link}
                  </a>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditing(g)
                    setFormOpen(true)
                  }}
                  className="text-sm text-slate-600 px-2 py-1"
                  aria-label="Редактировать"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(g)}
                  className="text-sm text-red-600 px-2 py-1"
                  aria-label="Удалить"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={formOpen}
        title={
          editing
            ? `Изменить: ${LAYER_LABELS[layer]}`
            : `Добавить: ${LAYER_LABELS[layer]}`
        }
        onClose={() => {
          setFormOpen(false)
          setEditing(undefined)
        }}
      >
        <GarmentForm
          layer={layer}
          initial={editing}
          onSave={handleSave}
          onCancel={() => {
            setFormOpen(false)
            setEditing(undefined)
          }}
        />
      </Modal>
    </section>
  )
}

function TopDetails({ g }: { g: Garment }) {
  const hasInsulation = g.insulation != null
  const hasDesc = !!g.modelDescription
  if (!hasInsulation && !hasDesc) return null
  return (
    <div className="mt-1 space-y-0.5">
      {hasInsulation && (
        <p className="text-xs text-slate-500">Утеплитель: {g.insulation} г</p>
      )}
      {hasDesc && (
        <p className="text-xs text-slate-600 line-clamp-2">{g.modelDescription}</p>
      )}
    </div>
  )
}