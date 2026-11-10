import { BUSINESS } from '../config'
import { formatPrice } from './format'

export function buildWhatsAppUrl(message: string, number: string = BUSINESS.whatsapp): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export interface OrderLine {
  qty: number
  name: string
  total: number
}

export interface OrderData {
  customer: string
  lines: OrderLine[]
  subtotal: number
  deliveryFee: number
  total: number
  fulfillment: 'entrega' | 'retirada'
  address?: string
  payment: string
  change?: string
  notes?: string
}

/** Texto do pedido que chega pronto no WhatsApp da pizzaria. */
export function buildOrderMessage(order: OrderData): string {
  const text: string[] = [
    `*Novo pedido - ${BUSINESS.name}*`,
    `Cliente: ${order.customer}`,
    '',
    '*Itens*',
    ...order.lines.map((line) => `${line.qty}x ${line.name} - ${formatPrice(line.total)}`),
    '',
    `Subtotal: ${formatPrice(order.subtotal)}`,
  ]

  if (order.fulfillment === 'entrega') {
    text.push(`Taxa de entrega: ${order.deliveryFee === 0 ? 'Grátis' : formatPrice(order.deliveryFee)}`)
  }

  text.push(`*Total: ${formatPrice(order.total)}*`, '')
  text.push(`Tipo: ${order.fulfillment === 'entrega' ? 'Entrega' : 'Retirada na loja'}`)
  if (order.address) text.push(`Endereço: ${order.address}`)
  text.push(`Pagamento: ${order.payment}${order.change ? ` (${order.change})` : ''}`)
  if (order.notes) text.push(`Observações: ${order.notes}`)

  return text.join('\n')
}
