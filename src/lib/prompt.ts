import type { Garment, Scenario } from '../types'
import { ACTIVITY_LABELS} from '../types'

/**
 * Определяет "сегодня" или "завтра" по времени начала прогулки.
 * Если время не указано — сегодня.
 * Если указанное время уже прошло сегодня — завтра.
 */
function computeDateLabel(startTime?: string): 'сегодня' | 'завтра' {
  if (!startTime) return 'сегодня'
  const [h, m] = startTime.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return 'сегодня'
  const now = new Date()
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  return target.getTime() < now.getTime() ? 'завтра' : 'сегодня'
}

export function buildPrompt(scenario: Scenario,
   garments: Garment[],
   ageLabel?: string): string {
    const top = garments.filter((g) => g.layer === 'top')
    const middle = garments.filter((g) => g.layer === 'middle')
    const base = garments.filter((g) => g.layer === 'base')
    const shoes = garments.filter((g) => g.layer === 'shoes')
    const accessories = garments.filter((g) => g.layer === 'accessories')

  const dateLabel = computeDateLabel(scenario.startTime)
  const timePart = scenario.startTime ? `, ${scenario.startTime}` : ''

  const lines: string[] = []
  lines.push('Выступи в роли эксперта по детской одежде.')
  lines.push('')
  lines.push(
    `Я иду на прогулку с ребёнком. Возраст ребёнка: ${ageLabel || '[впишите сами]'}.`
  )
  lines.push('')
  lines.push(`Место: ${scenario.location}`)
  lines.push(`Дата и время: ${dateLabel}${timePart}`)
  if (scenario.duration) lines.push(`Длительность: ${scenario.duration}`)
  if (scenario.activity) lines.push(`Активность ребёнка: ${ACTIVITY_LABELS[scenario.activity]}`)

  if (scenario.description) {
    lines.push('')
    lines.push(`Описание прогулки: ${scenario.description}`)
  }

  lines.push('')
  lines.push('Определи погоду самостоятельно на основе населённого пункта, даты,')
  lines.push('времени начала и длительности прогулки.')
  lines.push('')
  lines.push('Мой гардероб (используй ТОЛЬКО эти вещи):')
  lines.push('')
  lines.push('Верхний слой:')
  lines.push(...formatList(top, formatTopGarment))
  lines.push('')
  lines.push('Второй слой:')
  lines.push(...formatList(middle, (g) => `- ${g.title}`))
  lines.push('')
lines.push('Нижний слой:')
lines.push(...formatList(base, (g) => `- ${g.title}`))
lines.push('')
lines.push('Обувь:')
lines.push(...formatList(shoes, (g) => `- ${g.title}`))
lines.push('')
lines.push('Аксессуары:')
lines.push(...formatList(accessories, (g) => `- ${g.title}`))
  lines.push('')
  lines.push('Задача: как одеть и обуть ребёнка в минимальное количество слоёв,')
  lines.push('чтобы ему было комфортно? Не забудь про обувь и аксессуары.')
  lines.push('Выбери подходящие вещи из моего списка и кратко обоснуй выбор.')

  return lines.join('\n')
}

function formatList(items: Garment[], fmt: (g: Garment) => string): string[] {
  if (items.length === 0) return ['- (нет)']
  return items.map(fmt)
}

function formatTopGarment(g: Garment): string {
  const attrs: string[] = []
  if (g.insulation != null) attrs.push(`утеплитель ${g.insulation} г`)
  const base = attrs.length > 0 ? `- ${g.title} (${attrs.join(', ')})` : `- ${g.title}`
  return g.modelDescription ? `${base} — ${g.modelDescription}` : base
}