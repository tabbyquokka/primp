import { useState } from 'react'
import type { Activity, Scenario } from '../types'
import { ACTIVITY_LABELS } from '../types'
import { newId } from '../lib/id'
import { parseDurationMinutes, formatDuration } from '../lib/duration'

const DURATION_PRESETS = [30, 45, 60, 90, 120, 180]

interface ScenarioFormProps {
  initial?: Scenario
  defaultLocation?: string   
  onSave: (s: Scenario) => void
  onCancel: () => void
}



export function ScenarioForm({ initial, defaultLocation, onSave, onCancel }: ScenarioFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [location, setLocation] = useState(initial?.location ?? defaultLocation ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startTime, setStartTime] = useState(initial?.startTime ?? '')
    const [duration, setDuration] = useState(initial?.duration ?? '')
  const [activity, setActivity] = useState<Activity | ''>(initial?.activity ?? '')

  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Введите название')
    if (!location.trim()) return setError('Введите населённый пункт')
    if (!description.trim()) return setError('Введите описание')

    const draft: Scenario = {
      id: initial?.id ?? newId(),
      name: name.trim(),
      location: location.trim(),
      description: description.trim(),
      startTime: startTime.trim() || undefined,
      duration: duration.trim() || undefined,
      activity: activity === '' ? undefined : activity,
      createdAt: initial?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    }

    onSave(draft)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Название" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder="Например, Утренняя прогулка в парк"
          autoFocus
        />
      </Field>

      <Field label="Населённый пункт" required>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input"
          placeholder="Москва"
        />
      </Field>

      <Field label="Описание прогулки" required>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input min-h-[80px]"
          placeholder="Например, гуляем по парку, ребёнок бегает с горки"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">

      <Field label="Время начала" hint="опц.">
  <input
    type="time"
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    onFocus={(e) => {
      // Когда поле пустое и пользователь его открывает,
      // подставляем 10:00 — пикер откроется на этом значении
      if (!e.target.value) setStartTime('10:00')
    }}
    className="input"
  />
  {startTime && (
    <button
      type="button"
      onClick={() => setStartTime('')}
      className="text-xs text-slate-400 underline mt-1"
    >
      очистить
    </button>
  )}
</Field>

        <Field label="Длительность" hint="опц.">
  <DurationInput
    value={duration || undefined}
    onChange={(v) => setDuration(v ?? '')}
  />
</Field>
      </div>

      <Field label="Активность ребёнка" hint="опц.">
        <select
          value={activity}
          onChange={(e) => setActivity(e.target.value as Activity | '')}
          className="input"
        >
          <option value="">Не указано</option>
          {(Object.keys(ACTIVITY_LABELS) as Activity[]).map((a) => (
            <option key={a} value={a}>
              {ACTIVITY_LABELS[a]}
            </option>
          ))}
        </select>
      </Field>



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

function DurationInput({
    value,
    onChange,
  }: {
    value?: string
    onChange: (v?: string) => void
  }) {
    const minutes = parseDurationMinutes(value)
    const isPreset = minutes != null && DURATION_PRESETS.includes(minutes)
    const [customOpen, setCustomOpen] = useState(minutes != null && !isPreset)
  
    // При открытии "Другое" селекты показывают текущее значение.
    // Если значения нет — 0ч 00мин, но в duration ничего не пишется.
    const [customHours, setCustomHours] = useState(
      minutes != null ? Math.floor(minutes / 60) : 0
    )
    const [customMins, setCustomMins] = useState(
      minutes != null ? minutes % 60 : 0
    )
  
    function selectPreset(total: number) {
      setCustomOpen(false)
      onChange(formatDuration(total))
    }
  
    function openCustom() {
      // Только открываем селекты, значение НЕ трогаем
      setCustomOpen(true)
    }
  
    function applyCustom(h: number, m: number) {
        let total = h * 60 + m
        if (total < 30) total = 30
        setCustomHours(Math.floor(total / 60))
        setCustomMins(total % 60)
        onChange(formatDuration(total))
      }
  
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {DURATION_PRESETS.map((p) => {
            const active = !customOpen && minutes === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => selectPreset(p)}
                className={
                  'px-2.5 py-1.5 rounded-lg text-sm font-medium border transition ' +
                  (active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300')
                }
              >
                {formatDuration(p)}
              </button>
            )
          })}
          <button
            type="button"
            onClick={openCustom}
            className={
              'px-2.5 py-1.5 rounded-lg text-sm font-medium border transition ' +
              (customOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300')
            }
          >
            Другое
          </button>
        </div>
  
        {customOpen && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={customHours}
                onChange={(e) => applyCustom(Number(e.target.value), customMins)}
                className="input"
              >
{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                  <option key={h} value={h}>
                    {h} ч
                  </option>
                ))}
              </select>
              <select
                value={customMins}
                onChange={(e) => applyCustom(customHours, Number(e.target.value))}
                className="input"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, '0')} мин
                  </option>
                ))}
              </select>
            </div>
            {minutes == null && (
              <p className="text-xs text-slate-500">
                Выберите часы и минуты, чтобы задать длительность
              </p>
            )}
          </>
        )}
  
        {minutes != null && (
          <p className="text-xs text-slate-500">
            Итого: {formatDuration(minutes)} ·{' '}
            <button
              type="button"
              onClick={() => {
                setCustomOpen(false)
                onChange(undefined)
              }}
              className="underline text-slate-400"
            >
              очистить
            </button>
          </p>
        )}
      </div>
    )
  }