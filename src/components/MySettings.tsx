import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Settings } from '../types'
import { computeAgeLabel } from '../lib/age'
import { useRef } from 'react'
import { exportBackup, downloadBackup, importBackup } from '../lib/backup'

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
      
      <DataSection />
      
      <p className="text-xs text-slate-400 pt-4 border-t border-slate-200">
        Если дата рождения не указана, в промте останется placeholder
        «[впишите сами]», который можно заполнить вручную перед копированием.
      </p>
    </div>
  )
}

function DataSection() {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    setMessage(null)
    try {
      const blob = await exportBackup()
      downloadBackup(blob)
      setMessage({ kind: 'ok', text: 'Файл сохранён' })
    } catch (e) {
      setMessage({ kind: 'error', text: (e as Error).message })
    }
  }

  function triggerImport() {
    setMessage(null)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // позволяем выбрать тот же файл повторно
    if (!file) return

    if (!confirm('Импорт заменит все текущие данные. Сохраните текущее состояние, если не уверены. Продолжить?')) {
      return
    }

    setImporting(true)
    setMessage(null)
    try {
      await importBackup(file)
      setMessage({ kind: 'ok', text: 'Данные восстановлены, перезагружаем…' })
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setMessage({ kind: 'error', text: (err as Error).message })
      setImporting(false)
    }
  }

  return (
    <div className="pt-4 border-t border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Данные</h2>
      <p className="text-xs text-slate-500 mb-3">
        Резервная копия хранится у вас на устройстве в виде файла. Никуда не отправляется.
      </p>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleExport}
          className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium"
        >
          Скачать резервную копию
        </button>
        <button
          type="button"
          onClick={triggerImport}
          disabled={importing}
          className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-lg font-medium disabled:opacity-50"
        >
          {importing ? 'Импорт…' : 'Восстановить из файла'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {message && (
        <p
          className={
            'text-xs mt-2 ' +
            (message.kind === 'ok' ? 'text-green-600' : 'text-red-600')
          }
        >
          {message.text}
        </p>
      )}
    </div>
  )
}