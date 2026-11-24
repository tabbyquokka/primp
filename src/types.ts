export type Layer = 'top' | 'middle' | 'base' | 'shoes' | 'accessories'

export type Activity = 'active' | 'moderate' | 'calm' | 'stroller'

export type YesNoUnknown = 'yes' | 'no' | 'unknown'

export interface Garment {
    id: string
    layer: Layer
    title: string
    link?: string
  
    // Только для layer === 'top'
    insulation?: number        // граммовка, например 200
    modelDescription?: string  // свободное описание: модель, ткань, мембрана, проклейка швов
  
    createdAt: number
  }

export interface Settings {
    key: 'app'
    childBirthDate?: string  // ISO "2023-01-15"
    defaultCity?: string     // "Москва"
  }

export interface Scenario {
  id: string
  name: string
  location: string
  description: string
  startTime?: string        // "15:00"
  duration?: string         // "1.5 часа"
  activity?: Activity
  hasRainShelter?: YesNoUnknown
  hasWindShelter?: YesNoUnknown
  createdAt: number
  updatedAt: number
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

export const YES_NO_UNKNOWN_LABELS: Record<YesNoUnknown, string> = {
  yes: 'Да',
  no: 'Нет',
  unknown: 'Не указано',
}