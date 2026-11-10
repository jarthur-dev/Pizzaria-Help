export type ChatIntent = 'checkout'

export type Step =
  | 'idle'
  | 'ask_name'
  | 'menu'
  | 'category'
  | 'product'
  | 'variant'
  | 'qty'
  | 'after_add'
  | 'fulfillment'
  | 'address'
  | 'payment'
  | 'change'
  | 'notes'
  | 'confirm'
  | 'done'

export interface ChatOption {
  label: string
  value: string
  /** Quando existe, a opção abre este link (ex.: WhatsApp) em vez de só responder no chat. */
  href?: string
}

export interface ChatCardRow {
  label: string
  value: string
  strong?: boolean
}

export interface ChatCard {
  title: string
  rows: ChatCardRow[]
}

export interface ChatMessage {
  id: number
  from: 'bot' | 'user'
  text: string
  card?: ChatCard
  options?: ChatOption[]
}
