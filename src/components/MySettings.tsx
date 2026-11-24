import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Settings } from '../types'
import { computeAgeLabel } from '../lib/age'

export function SettingsScreen() {
  const settings = useLiveQuery(async () => {
    const s = await db.settings.get('app')
    return s ?? { key: 'app' as const }
  }, [])

  if (settings === undefined) {
    return <p className="text-sm text-slate-400">Загрузка…</p>
  }

  return <SettingsContent initial={settings} />
}

function SettingsContent({ initial }: { initial: Settings }) {
  const [birthDate, setBirthDate] = useState(initial.childBirthDate ?? '')
  const [defaultCity, setDefaultCity] = useState(initial.defaultCity ?? '')
  const [savedAt, setSavedAt] = useState(0)

  async function save(patch: Partial<Settings>) {
    const current = (await db.settings.get('app')) ?? { key: 'app' as const }
    await db.settings.put({ ...current, ...patch })
    setSavedAt(Date.now())
  }

  function handleBirthDate(value: string) {
    setBirthDate(value)
    save({ childBirthDate: value || undefined })
  }



  // debounce для города, чтобы не писать в IndexedDB на каждый символ
  const [cityTimer, setCityTimer] = useState<number | undefined>(undefined)
  function onChangeCity(value: string) {
    setDefaultCity(value)
    if (cityTimer) window.clearTimeout(cityTimer)
    const t = window.setTimeout(() => {
      save({ defaultCity: value.trim() || undefined })
    }, 400)
    setCityTimer(t)
  }

  const ageLabel = birthDate ? computeAgeLabel(birthDate) : ''
  const todayISO = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Ребёнок</h2>
        <p className="text-xs text-slate-500 mb-3">
          Используется в промте. Данные хранятся только в вашем браузере и никуда не отправляются.
        </p>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">
            Дата рождения
          </span>
          <input
            type="date"
            value={birthDate}
            max={todayISO}
            onChange={(e) => handleBirthDate(e.target.value)}
            className="input"
          />
        </label>

        {ageLabel && (
          <p className="text-sm text-slate-700 mt-2">
            Возраст: <span className="font-medium">{ageLabel}</span>
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Город по умолчанию</h2>
        <p className="text-xs text-slate-500 mb-3">
          Подставляется в новые сценарии прогулок. В каждом сценарии можно поменять.
        </p>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700 mb-1">
            Населённый пункт
          </span>
          <input
            type="text"
            value={defaultCity}
            onChange={(e) => onChangeCity(e.target.value)}
            className="input"
            placeholder="Например, Москва"
          />
        </label>
      </div>

      {savedAt > 0 && (
        <p className="text-xs text-green-600">Сохранено</p>
      )}

      <p className="text-xs text-slate-400 pt-4 border-t border-slate-200">
        Если дата рождения не указана, в промте останется placeholder
        «[впишите сами]», который можно заполнить вручную перед копированием.
      </p>
    </div>
  )
}