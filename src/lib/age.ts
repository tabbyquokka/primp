export function computeAgeLabel(birthDate: string): string {
    const birth = new Date(birthDate)
    if (Number.isNaN(birth.getTime())) return ''
    const now = new Date()
  
    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    if (now.getDate() < birth.getDate()) months--
    if (months < 0) {
      years--
      months += 12
    }
  
    if (years === 0 && months === 0) return 'меньше месяца'
    if (years === 0) return `${months} ${plural(months, 'месяц', 'месяца', 'месяцев')}`
    if (months === 0) return `${years} ${plural(years, 'год', 'года', 'лет')}`
    return `${years} ${plural(years, 'год', 'года', 'лет')} ${months} ${plural(months, 'месяц', 'месяца', 'месяцев')}`
  }
  
  function plural(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod10 === 1 && mod100 !== 11) return one
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
    return many
  }