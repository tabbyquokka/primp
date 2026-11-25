import { db } from '../db'
import type { Garment, Scenario, Settings } from '../types'

const BACKUP_VERSION = 1

interface BackupFile {
  app: 'child-wardrobe'
  version: number
  exportedAt: string
  garments: Garment[]
  scenarios: Scenario[]
  settings: Settings[]
}

export async function exportBackup(): Promise<Blob> {
  const [garments, scenarios, settings] = await Promise.all([
    db.garments.toArray(),
    db.scenarios.toArray(),
    db.settings.toArray(),
  ])
  const payload: BackupFile = {
    app: 'child-wardrobe',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    garments,
    scenarios,
    settings,
  }
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
}

export function downloadBackup(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `child-wardrobe-backup-${date}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File): Promise<void> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Файл не является корректным JSON')
  }
  if (!isBackupFile(parsed)) {
    throw new Error('Это не файл резервной копии приложения «Одёжка»')
  }
  if (parsed.version !== BACKUP_VERSION) {
    throw new Error(
      `Несовместимая версия резервной копии: ${parsed.version}. Ожидается ${BACKUP_VERSION}`
    )
  }

  // Импорт заменяет всё содержимое — это семантика «восстановления из бэкапа»
  await db.transaction('rw', db.garments, db.scenarios, db.settings, async () => {
    await db.garments.clear()
    await db.scenarios.clear()
    await db.settings.clear()
    if (parsed.garments.length) await db.garments.bulkPut(parsed.garments)
    if (parsed.scenarios.length) await db.scenarios.bulkPut(parsed.scenarios)
    if (parsed.settings.length) await db.settings.bulkPut(parsed.settings)
  })
}

function isBackupFile(x: unknown): x is BackupFile {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    o.app === 'child-wardrobe' &&
    typeof o.version === 'number' &&
    Array.isArray(o.garments) &&
    Array.isArray(o.scenarios) &&
    Array.isArray(o.settings)
  )
}