/**
 * Парсит текст длительности в минуты.
 * Поддерживает наш формат ("1 ч 30 мин" / "1 ч" / "30 мин")
 * и старый ("1.5 часа" / "1,5 ч").
 * Возвращает null, если распарсить не удалось.
 */
export function parseDurationMinutes(text?: string): number | null {
    if (!text) return null
    const s = text.toLowerCase().replace(',', '.').trim()
  
    if (/^\d+\s*ч\s+\d+\s*мин$/.test(s)) {
      const m = s.match(/^(\d+)\s*ч\s+(\d+)\s*мин$/)!
      return parseInt(m[1]) * 60 + parseInt(m[2])
    }
    if (/^\d+\s*ч$/.test(s)) {
      return parseInt(s.match(/(\d+)/)![1]) * 60
    }
    if (/^\d+\s*мин$/.test(s)) {
      return parseInt(s.match(/(\d+)/)![1])
    }
  
    const dec = s.match(/^(\d+(?:\.\d+)?)\s*(?:час|ч)/)
    if (dec) return Math.round(parseFloat(dec[1]) * 60)
  
    return null
  }
  
  export function formatDuration(minutes?: number | null): string | undefined {
    if (minutes == null || minutes <= 0) return undefined
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m} мин`
    if (m === 0) return `${h} ч`
    return `${h} ч ${m} мин`
  }