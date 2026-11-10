import { BUSINESS } from '../config'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatPrice(value: number): string {
  return brl.format(value)
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/** Taxa de entrega para um subtotal. Grátis a partir do valor definido em config. */
export function deliveryFeeFor(subtotal: number): number {
  return subtotal >= BUSINESS.freeDeliveryAbove ? 0 : BUSINESS.deliveryFee
}

/** Lê valores como "100", "R$ 100,50" ou "1.000,00". Retorna null se não houver número. */
export function parseMoney(text: string): number | null {
  const match = text.replace(/\./g, '').replace(',', '.').match(/\d+(\.\d+)?/)
  if (!match) return null
  const value = Number(match[0])
  return Number.isFinite(value) ? value : null
}
