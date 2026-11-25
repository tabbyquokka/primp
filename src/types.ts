export type Layer = 'top' | 'middle' | 'base' | 'shoes' | 'accessories'

export type Activity = 'active' | 'moderate' | 'calm' | 'stroller'

export interface Garment {
  id: string
  layer: Layer
  title: string
  link?: string

  // Только для layer === 'top'
  insulation?: number
  modelDescription?: string

  createdAt: number
}

export interface Scenario {
  id: string
  name: string
  location: string
  description: string
  startTime?: string        // "15:00"
  duration?: string         // "1.5 часа"
  activity?: Activity
  createdAt: number
  updatedAt: number
}

export interface Settings {
  key: 'app'
  childBirthDate?: string   // ISO "2023-01-15"
  defaultCity?: string      // "Москва"
}

export const LAYER_LABELS: Record<Layer, string> = {
  top: 'Верхний слой',
  middle: 'Второй слой',
  base: 'Нижний слой',
  shoes: 'Обувь',
  accessories: 'Аксессуары',
}

export const ACTIVITY_LABELS: Record<Activity, string> = {
  active: 'Активный',
  moderate: 'Умеренно активный',
  calm: 'Неактивный',
  stroller: 'В коляске',
}