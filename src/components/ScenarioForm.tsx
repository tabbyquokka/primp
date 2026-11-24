import { useState } from 'react'
import type { Activity, Scenario, YesNoUnknown } from '../types'
import { ACTIVITY_LABELS, YES_NO_UNKNOWN_LABELS } from '../types'
import { newId } from '../lib/id'

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
  const [hasRainShelter, setHasRainShelter] = useState<YesNoUnknown>(
    initial?.hasRainShelter ?? 'unknown'
  )
  const [hasWindShelter, setHasWindShelter] = useState<YesNoUnknown>(
    initial?.hasWindShelter ?? 'unknown'
  )
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
      hasRainShelter,
      hasWindShelter,
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
            className="input"
          />
        </Field>
        <Field label="Длительность" hint="опц.">
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input"
            placeholder="1.5 часа"
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

      <Field label="Укрытие от дождя" hint="опц.">
        <YesNoUnknownSelect value={hasRainShelter} onChange={setHasRainShelter} />
      </Field>

      <Field label="Укрытие от ветра" hint="опц.">
        <YesNoUnknownSelect value={hasWindShelter} onChange={setHasWindShelter} />
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

function YesNoUnknownSelect({
  value,
  onChange,
}: {
  value: YesNoUnknown
  onChange: (v: YesNoUnknown) => void
}) {
  const options: YesNoUnknown[] = ['yes', 'no', 'unknown']
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={
            'py-2 rounded-lg text-sm font-medium border transition ' +
            (value === opt
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300')
          }
        >
          {YES_NO_UNKNOWN_LABELS[opt]}
        </button>
      ))}
    </div>
  )
}