import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Scenario } from '../types'
import { ACTIVITY_LABELS} from '../types'
import { ScenarioForm } from './ScenarioForm'
import { Modal } from './Modal'
import { PromptModal } from './PromtModal'

export function ScenarioList() {
    const scenarios = useLiveQuery(
      () => db.scenarios.orderBy('updatedAt').reverse().toArray(),
      []
    )
    const defaultCity = useLiveQuery(async () => {
      const s = await db.settings.get('app')
      return s?.defaultCity
    }, [])
  
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Scenario | undefined>(undefined)
    const [promptScenario, setPromptScenario] = useState<Scenario | null>(null)
  
    async function handleSave(s: Scenario) {
      await db.scenarios.put(s)
      setFormOpen(false)
      setEditing(undefined)
    }
  
    async function handleDelete(s: Scenario) {
      if (!confirm(`Удалить «${s.name}»?`)) return
      await db.scenarios.delete(s.id)
    }
  
    return (
      <div className="space-y-3">
        <button
          onClick={() => {
            setEditing(undefined)
            setFormOpen(true)
          }}
          className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium"
        >
          + Новый сценарий
        </button>
      {scenarios === undefined ? (
        <p className="text-sm text-slate-400">Загрузка…</p>
      ) : scenarios.length === 0 ? (
        <p className="text-sm text-slate-400">
          Пока нет сценариев. Создайте первый, чтобы сформировать промт.
        </p>
      ) : (
        <ul className="space-y-2">
          {scenarios.map((s) => (
            <li
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {s.location}
                    {s.startTime && ` · ${s.startTime}`}
                    {s.duration && ` · ${s.duration}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditing(s)
                      setFormOpen(true)
                    }}
                    className="text-sm text-slate-600 px-2 py-1"
                    aria-label="Редактировать"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="text-sm text-red-600 px-2 py-1"
                    aria-label="Удалить"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {s.description && (
                <p className="text-xs text-slate-600 line-clamp-2">{s.description}</p>
              )}

              <div className="flex flex-wrap gap-1 text-xs">
                {s.activity && (
                  <span className="bg-slate-100 text-slate-700 rounded px-2 py-0.5">
                    {ACTIVITY_LABELS[s.activity]}
                  </span>
                )}

              </div>

              <button
                onClick={() => setPromptScenario(s)}
                className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium text-sm"
              >
                Сформировать промт
              </button>
            </li>
          ))}
        </ul>
      )}

    <Modal
        open={formOpen}
        title={editing ? 'Изменить сценарий' : 'Новый сценарий'}
        onClose={() => {
          setFormOpen(false)
          setEditing(undefined)
        }}
      >
        <ScenarioForm
          initial={editing}
          defaultLocation={editing ? undefined : defaultCity}
          onSave={handleSave}
          onCancel={() => {
            setFormOpen(false)
            setEditing(undefined)
          }}
        />
      </Modal>

      {promptScenario && (
        <PromptModal scenario={promptScenario} onClose={() => setPromptScenario(null)} />
      )}
    </div>
  )
}


