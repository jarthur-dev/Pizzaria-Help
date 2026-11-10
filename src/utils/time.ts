import { HOURS } from '../config'

/** A pizzaria está aberta neste momento? Usa o relógio do navegador do cliente. */
export function isOpenNow(date: Date = new Date()): boolean {
  const today = HOURS[date.getDay()]
  if (!today) return false
  const [openHour, openMinute] = today.open.split(':').map(Number)
  const [closeHour, closeMinute] = today.close.split(':').map(Number)
  const minutes = date.getHours() * 60 + date.getMinutes()
  return minutes >= openHour * 60 + openMinute && minutes < closeHour * 60 + closeMinute
}
