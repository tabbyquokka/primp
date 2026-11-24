import Dexie, { type Table } from 'dexie'
import type { Garment, Scenario } from './types'

import type { Settings } from './types'

export class AppDatabase extends Dexie {
  garments!: Table<Garment, string>
  scenarios!: Table<Scenario, string>
  settings!: Table<Settings, string>

  constructor() {
    super('child-wardrobe')
    this.version(1).stores({
      garments: 'id, layer, signature, createdAt',
      scenarios: 'id, createdAt, updatedAt',
    })
    this.version(2).stores({
      garments: 'id, layer, signature, createdAt',
      scenarios: 'id, createdAt, updatedAt',
      settings: 'key',
    })
    this.version(3).stores({
        garments: 'id, layer, createdAt',
        scenarios: 'id, createdAt, updatedAt',
        settings: 'key',
      })
  }
}
export const db = new AppDatabase()

