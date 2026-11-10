/**
 * Dados do negócio. Troque tudo que está marcado como EXEMPLO pelos dados reais.
 */
export const BUSINESS = {
  name: 'Pizzaria Help',

  /** EXEMPLO: número do WhatsApp que recebe os pedidos, só dígitos, com 55 + DDD. */
  whatsapp: '5500900000000',
  /** EXEMPLO: telefone exibido no site. */
  phoneDisplay: '(00) 90000-0000',
  /** EXEMPLO: endereço da loja. */
  address: 'Rua Exemplo, 123, Centro',
  /** EXEMPLO: perfil do Instagram. */
  instagram: '@pizzariahelp',

  deliveryFee: 6,
  freeDeliveryAbove: 80,
  deliveryEta: '35 a 50 min',
  pickupEta: '20 a 30 min',

  /** Texto exibido no site. Mantenha em sincronia com HOURS abaixo. */
  hoursSummary: 'Terça a domingo, 18h às 23h30',
}

export interface DayHours {
  open: string
  close: string
}

/** Horário de funcionamento por dia da semana (0 = domingo). `null` = fechado. */
export const HOURS: Record<number, DayHours | null> = {
  0: { open: '18:00', close: '23:30' },
  1: null,
  2: { open: '18:00', close: '23:30' },
  3: { open: '18:00', close: '23:30' },
  4: { open: '18:00', close: '23:30' },
  5: { open: '18:00', close: '23:30' },
  6: { open: '18:00', close: '23:30' },
}
