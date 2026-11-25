import { useState } from 'react'
import type { Garment, Layer } from '../types'
import { newId } from '../lib/id'

interface GarmentFormProps {
  layer: Layer
  initial?: Garment
  onSave: (g: Garment) => void
  onCancel: () => void
}

export function GarmentForm({ layer, initial, onSave, onCancel }: GarmentFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
 // const [link, setLink] = useState(initial?.link ?? '')
  const [insulation, setInsulation] = useState<string>(
    initial?.insulation != null ? String(initial.insulation) : ''
  )
  const [modelDescription, setModelDescription] = useState(initial?.modelDescription ?? '')
  const [error, setError] = useState<string | null>(null)

  const isTop = layer === 'top'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Введите название вещи')
      return
    }

    let insulationNum: number | undefined
    if (isTop && insulation.trim() !== '') {
      const n = Number(insulation)
      if (Number.isNaN(n) || n < 0) {
        setError('Граммовка утеплителя должна быть неотрицательным числом')
        return
      }
      insulationNum = n
    }

    const draft: Garment = {
      id: initial?.id ?? newId(),
      layer,
      title: title.trim(),
     // link: link.trim() || undefined,
      insulation: isTop ? insulationNum : undefined,
      modelDescription: isTop ? (modelDescription.trim() || undefined) : undefined,
      createdAt: initial?.createdAt ?? Date.now(),
    }

    onSave(draft)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Название" required>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          placeholder=""
          autoFocus
        />
      </Field>

{/*       <Field label="Ссылка на товар" hint="опц.">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="input"
          placeholder="https://..."
        />
      </Field> */}

      {isTop && (
        <>
          <Field label="Утеплитель, г" hint="опц., например 200">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={insulation}
              onChange={(e) => setInsulation(e.target.value)}
              className="input"
              placeholder="200"
            />
          </Field>

          <Field
            label="Описание модели"
            hint="опц."
          >
            <textarea
              value={modelDescription}
              onChange={(e) => setModelDescription(e.target.value)}
              className="input min-h-[100px]"
              placeholder="Например: Reima Stavanger, ткань — нейлон с ПУ-пропиткой, мембрана 10000/5000, проклейка швов"
            />
            <p className="text-xs text-slate-500 mt-1">
              Рекомендуем указать: название модели, параметры ткани,
              мембраны, проклейку швов.
            </p>
          </Field>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg font-medium"
        >
          Сохранить
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium"
        >
          Отменить
        </button>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {hint && <span className="text-slate-400 font-normal"> — {hint}</span>}
      </span>
      {children}
    </label>
  )
}