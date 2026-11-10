import { useEffect, useRef, useState } from 'react'
import { BUSINESS } from '../config'
import { useCart } from '../context/CartContext'
import type { CartLine } from '../context/CartContext'
import { CATEGORIES, PRODUCTS, findProduct, getProduct, minPrice, variantTitle } from '../data/products'
import type { Category, Product } from '../types'
import { deliveryFeeFor, formatPrice, parseMoney, round2 } from '../utils/format'
import { normalize } from '../utils/text'
import { isOpenNow } from '../utils/time'
import { buildOrderMessage, buildWhatsAppUrl } from '../utils/whatsapp'
import type { OrderData } from '../utils/whatsapp'
import type { ChatCard, ChatIntent, ChatMessage, ChatOption, Step } from './types'

/**
 * Chatbot de pedidos da Pizzaria Help.
 *
 * É um fluxo guiado (sem IA e sem backend): o cliente escolhe itens por botões ou digitando,
 * informa entrega/retirada, endereço e pagamento, e o pedido é enviado já formatado
 * para o WhatsApp da pizzaria (link wa.me). O carrinho é o mesmo usado pelo site.
 *
 * Todo o estado do fluxo fica em refs; por isso as funções abaixo podem ser recriadas
 * a cada render sem causar valores "velhos".
 */

const NAME_KEY = 'pizzaria-help:name'

const HUMAN_URL = buildWhatsAppUrl(`Olá! Vim pelo site da ${BUSINESS.name} e gostaria de falar com um atendente.`)

const MENU_OPTIONS: ChatOption[] = [
  { label: '🍕 Fazer pedido', value: 'order' },
  { label: '📖 Ver cardápio', value: 'catalog' },
  { label: '🛵 Entrega e horários', value: 'info' },
  { label: '💬 Falar com atendente', value: 'human', href: HUMAN_URL },
]

interface Session {
  name: string
  categoryId?: Category
  productId?: string
  variantId?: string
  fulfillment?: 'entrega' | 'retirada'
  address?: string
  payment?: string
  change?: string
  notes?: string
  lastUrl?: string
  pendingIntent?: ChatIntent
}

interface Options {
  closeChat: () => void
}

function lineName(line: CartLine): string {
  return line.product.variants.length > 1 ? `${line.product.name} (${line.variant.label})` : line.product.name
}

function priceLabel(product: Product): string {
  const price = formatPrice(minPrice(product))
  return product.variants.length > 1 ? `a partir de ${price}` : price
}

function matchMenuIntent(normalized: string): string | null {
  if (/cardapio|sabores|opcoes/.test(normalized)) return 'catalog'
  if (/horario|aberto|funciona|entrega|taxa|frete|endereco|onde/.test(normalized)) return 'info'
  if (/atendente|humano|pessoa|falar|ajuda/.test(normalized)) return 'human'
  if (/pedi|quero|comprar|encomend|fome/.test(normalized)) return 'order'
  return null
}

export function useChatbot({ closeChat }: Options) {
  const cart = useCart()
  const cartRef = useRef(cart)
  cartRef.current = cart
  const closeRef = useRef(closeChat)
  closeRef.current = closeChat

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState(false)
  const [step, setStepState] = useState<Step>('idle')

  const stepRef = useRef<Step>('idle')
  const session = useRef<Session>({ name: '' })
  const idRef = useRef(0)
  const aliveRef = useRef(true)
  const startedRef = useRef(false)
  const busyRef = useRef(false)
  const lastOptions = useRef<ChatOption[]>([])

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  // ---------- Infraestrutura ----------

  const setStep = (next: Step) => {
    stepRef.current = next
    setStepState(next)
  }

  const push = (message: Omit<ChatMessage, 'id'>) => {
    idRef.current += 1
    const full: ChatMessage = { ...message, id: idRef.current }
    setMessages((prev) => [...prev, full])
  }

  const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  /** Mostra "digitando…" por um instante e então publica a mensagem do bot. */
  async function say(text: string, extra: { card?: ChatCard; options?: ChatOption[] } = {}) {
    if (!aliveRef.current) return
    setTyping(true)
    await sleep(Math.min(350 + text.length * 7, 1100))
    if (!aliveRef.current) return
    setTyping(false)
    if (extra.options) lastOptions.current = extra.options
    push({ from: 'bot', text, card: extra.card, options: extra.options })
  }

  const userSay = (text: string) => push({ from: 'user', text })

  async function run(task: () => Promise<void>) {
    if (busyRef.current) return
    busyRef.current = true
    try {
      await task()
    } catch (error) {
      console.error('[chatbot]', error)
    } finally {
      busyRef.current = false
      if (aliveRef.current) setTyping(false)
    }
  }

  const firstName = () => session.current.name.split(' ')[0]

  const closedNote = () =>
    isOpenNow()
      ? ''
      : '\n\nNo momento estamos fechados, mas você pode montar o pedido e a nossa equipe responde assim que abrir.'

  function cartCard(title = 'Seu pedido até agora'): ChatCard {
    const { lines, subtotal } = cartRef.current
    return {
      title,
      rows: [
        ...lines.map((line) => ({ label: `${line.item.qty}x ${lineName(line)}`, value: formatPrice(line.total) })),
        { label: 'Subtotal', value: formatPrice(subtotal), strong: true },
      ],
    }
  }

  function totals() {
    const { subtotal } = cartRef.current
    const fee = session.current.fulfillment === 'entrega' ? deliveryFeeFor(subtotal) : 0
    return { subtotal, fee, total: round2(subtotal + fee) }
  }

  // ---------- Início e menu ----------

  async function greet() {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(NAME_KEY)
    } catch {
      /* sem armazenamento: pergunta o nome */
    }
    if (saved) {
      session.current.name = saved
      await say(`Oi de novo, ${firstName()}! Que bom te ver por aqui.${closedNote()}`)
      return afterName()
    }
    setStep('ask_name')
    await say(
      `Oi! 👋 Eu sou a Help, assistente virtual da ${BUSINESS.name}. Eu monto o seu pedido por aqui e envio tudo prontinho para o nosso WhatsApp.\n\nComo posso te chamar?`,
    )
  }

  async function onName(text: string) {
    const cleaned = text
      .replace(/^(oi|ol[aá])[,!.\s]+/i, '')
      .replace(/^(meu nome [eé]|me chamo|me chama de|eu sou (o|a)?|sou (o|a)?)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40)
    if (cleaned.length < 2) {
      await say('Pode me dizer o seu nome? 🙂')
      return
    }
    const name = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    session.current.name = name
    try {
      localStorage.setItem(NAME_KEY, name)
    } catch {
      /* ignora */
    }
    await say(`Prazer, ${firstName()}! 😊${closedNote()}`)
    return afterName()
  }

  async function afterName() {
    const intent = session.current.pendingIntent
    session.current.pendingIntent = undefined
    if (intent === 'checkout') return startCheckout()
    return showMenu('Como posso te ajudar hoje?')
  }

  async function showMenu(text = 'Como posso te ajudar?') {
    setStep('menu')
    await say(text, { options: MENU_OPTIONS })
  }

  async function showInfo() {
    await say(
      [
        `Horário: ${BUSINESS.hoursSummary}`,
        isOpenNow() ? 'Estamos abertos agora. 🟢' : 'No momento estamos fechados. 🔴',
        `Entrega: ${BUSINESS.deliveryEta}, taxa de ${formatPrice(BUSINESS.deliveryFee)} (grátis a partir de ${formatPrice(BUSINESS.freeDeliveryAbove)})`,
        `Retirada: ${BUSINESS.pickupEta}, em ${BUSINESS.address}`,
      ].join('\n'),
    )
    return showMenu('Posso ajudar com mais alguma coisa?')
  }

  async function human() {
    await say('Abri o WhatsApp para você falar com a nossa equipe. Se a janela não abrir, é só tocar no botão de novo.')
    return showMenu('Enquanto isso, posso ajudar com mais alguma coisa?')
  }

  async function goCatalog() {
    await say('Vou te levar até o cardápio completo. 👇')
    await showMenu('Quando decidir, é só me chamar por aqui que eu finalizo o pedido.')
    closeRef.current()
    setTimeout(() => {
      document.getElementById('cardapio')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }

  // ---------- Montar o pedido ----------

  async function askCategory(text = 'Beleza! O que você quer pedir?') {
    setStep('category')
    await say(text, {
      options: [
        ...CATEGORIES.map((category) => ({ label: `${category.emoji} ${category.label}`, value: `c:${category.id}` })),
        { label: '⬅️ Voltar', value: 'menu' },
      ],
    })
  }

  async function onCategory(value: string) {
    if (value.startsWith('c:')) {
      const id = value.slice(2)
      const category = CATEGORIES.find((c) => c.id === id)
      if (category) return askProducts(category.id)
    }
    return fallback()
  }

  async function askProducts(categoryId: Category) {
    const meta = CATEGORIES.find((c) => c.id === categoryId)
    if (!meta) return askCategory()
    session.current.categoryId = categoryId
    setStep('product')
    const options: ChatOption[] = PRODUCTS.filter((p) => p.category === categoryId).map((p) => ({
      label: `${p.name} · ${priceLabel(p)}`,
      value: `p:${p.id}`,
    }))
    options.push({ label: '⬅️ Voltar', value: 'order' })
    await say(`${meta.emoji} ${meta.label}: toque no que você quer ou digite o nome.`, { options })
  }

  async function onProduct(value: string) {
    if (value.startsWith('p:')) {
      const product = getProduct(value.slice(2))
      if (product) return selectProduct(product)
    }
    return fallback()
  }

  async function selectProduct(product: Product) {
    session.current.productId = product.id
    session.current.categoryId = product.category
    if (product.variants.length === 1) {
      session.current.variantId = product.variants[0].id
      await say(`${product.name}: ${product.description}`)
      return askQty()
    }
    setStep('variant')
    await say(`${product.name}: ${product.description}\n\nQual tamanho você quer?`, {
      options: [
        ...product.variants.map((variant) => ({
          label: `${variantTitle(variant)} · ${formatPrice(variant.price)}`,
          value: `v:${variant.id}`,
        })),
        { label: '⬅️ Voltar', value: 'back' },
      ],
    })
  }

  async function onVariant(value: string) {
    if (value === 'back') return askProducts(session.current.categoryId ?? 'salgadas')
    if (value.startsWith('v:')) {
      const product = getProduct(session.current.productId ?? '')
      const variant = product?.variants.find((v) => v.id === value.slice(2))
      if (product && variant) {
        session.current.variantId = variant.id
        return askQty()
      }
    }
    return fallback()
  }

  async function askQty() {
    const product = getProduct(session.current.productId ?? '')
    if (!product) return askCategory()
    setStep('qty')
    await say(`Quantas unidades de ${product.name}? Toque num número ou digite a quantidade.`, {
      options: [
        ...[1, 2, 3, 4].map((n) => ({ label: String(n), value: `q:${n}` })),
        { label: '⬅️ Voltar', value: 'order' },
      ],
    })
  }

  async function onQty(value: string) {
    if (value.startsWith('q:')) {
      const qty = Number(value.slice(2))
      if (Number.isInteger(qty) && qty >= 1 && qty <= 20) return addCurrent(qty)
    }
    return fallback()
  }

  async function addCurrent(qty: number) {
    const product = getProduct(session.current.productId ?? '')
    const variantId = session.current.variantId
    if (!product || !variantId) return askCategory()
    cartRef.current.add(product.id, variantId, qty)
    setStep('after_add')
    await say(`Anotado: ${qty}x ${product.name} no seu pedido. ✅`)
    // O carrinho já foi atualizado quando esta segunda mensagem é montada.
    await say('Quer mais alguma coisa?', {
      card: cartCard(),
      options: [
        { label: '➕ Adicionar mais itens', value: 'order' },
        { label: '✅ Finalizar pedido', value: 'checkout' },
        { label: '🗑️ Limpar pedido', value: 'clear' },
      ],
    })
  }

  async function onAfterAdd(value: string) {
    if (value === 'checkout') return askFulfillment()
    if (value === 'clear') {
      cartRef.current.clear()
      await say('Pedido limpo. Podemos começar de novo quando você quiser.')
      return showMenu()
    }
    return fallback()
  }

  // ---------- Finalizar ----------

  async function startCheckout() {
    if (cartRef.current.lines.length === 0) {
      return showMenu('Seu pedido está vazio por enquanto. Vamos escolher o que você vai querer?')
    }
    await say('Vi que você já escolheu estes itens no site. 👇', { card: cartCard('Seu pedido') })
    return askFulfillment()
  }

  async function askFulfillment() {
    if (cartRef.current.lines.length === 0) {
      return showMenu('Seu pedido está vazio por enquanto. Vamos escolher o que você vai querer?')
    }
    setStep('fulfillment')
    const fee = deliveryFeeFor(cartRef.current.subtotal)
    await say(
      `Como você prefere receber?\n🛵 Entrega: ${fee === 0 ? 'grátis' : formatPrice(fee)}, em média ${BUSINESS.deliveryEta}\n🏪 Retirada: grátis, pronta em ${BUSINESS.pickupEta}`,
      {
        options: [
          { label: '🛵 Entrega', value: 'entrega' },
          { label: '🏪 Retirada na loja', value: 'retirada' },
        ],
      },
    )
  }

  async function onFulfillment(value: string) {
    if (value === 'entrega') {
      session.current.fulfillment = 'entrega'
      setStep('address')
      await say('Perfeito! Me passa o endereço completo da entrega: rua, número, bairro e um ponto de referência. 📍')
      return
    }
    if (value === 'retirada') {
      session.current.fulfillment = 'retirada'
      session.current.address = undefined
      await say(`Combinado! A retirada é em ${BUSINESS.address}.`)
      return askPayment()
    }
    return fallback()
  }

  async function onAddress(text: string) {
    if (text.trim().length < 8) {
      await say('Preciso do endereço completo para a entrega: rua, número e bairro. 🙏')
      return
    }
    session.current.address = text.trim()
    await say('Endereço anotado. ✅')
    return askPayment()
  }

  async function askPayment() {
    setStep('payment')
    await say('Qual será a forma de pagamento?', {
      options: [
        { label: 'Pix', value: 'pix' },
        { label: 'Cartão', value: 'card' },
        { label: 'Dinheiro', value: 'cash' },
      ],
    })
  }

  async function onPayment(value: string) {
    if (value === 'pix') session.current.payment = 'Pix'
    else if (value === 'card') session.current.payment = 'Cartão (débito ou crédito)'
    else if (value === 'cash') session.current.payment = 'Dinheiro'
    else return fallback()

    session.current.change = undefined
    if (value === 'cash') return askChange()
    return askNotes()
  }

  async function askChange() {
    setStep('change')
    await say('Vai precisar de troco? Digite o valor da nota (por exemplo, 100) ou toque no botão.', {
      options: [{ label: 'Não preciso de troco', value: 'no-change' }],
    })
  }

  async function onChange(value: string) {
    if (value === 'no-change') {
      session.current.change = undefined
      return askNotes()
    }
    return fallback()
  }

  async function onChangeText(text: string) {
    if (/^(nao|n|sem|nada)\b/.test(normalize(text))) return onChange('no-change')
    const amount = parseMoney(text)
    if (amount === null) {
      await say('Digite só o valor da nota, por exemplo 100, ou toque em "Não preciso de troco".')
      return
    }
    const { total } = totals()
    if (amount < total) {
      await say(`O total do pedido é ${formatPrice(total)}. Digite um valor igual ou maior para o troco. 🙂`)
      return
    }
    session.current.change = amount === total ? undefined : `troco para ${formatPrice(amount)}`
    return askNotes()
  }

  async function askNotes() {
    setStep('notes')
    await say('Alguma observação? Por exemplo: sem cebola, borda recheada ou outro sabor no combo.', {
      options: [{ label: 'Sem observações', value: 'no-notes' }],
    })
  }

  async function onNotes(value: string) {
    session.current.notes = value === 'no-notes' ? undefined : value.trim()
    return showConfirm()
  }

  async function showConfirm() {
    setStep('confirm')
    const { lines } = cartRef.current
    const { subtotal, fee, total } = totals()
    const s = session.current
    const fulfillment = s.fulfillment ?? 'retirada'

    const order: OrderData = {
      customer: s.name,
      lines: lines.map((line) => ({ qty: line.item.qty, name: lineName(line), total: line.total })),
      subtotal,
      deliveryFee: fee,
      total,
      fulfillment,
      address: s.address,
      payment: s.payment ?? 'A combinar',
      change: s.change,
      notes: s.notes,
    }
    const url = buildWhatsAppUrl(buildOrderMessage(order))
    s.lastUrl = url

    const rows: ChatCard['rows'] = [
      ...order.lines.map((line) => ({ label: `${line.qty}x ${line.name}`, value: formatPrice(line.total) })),
      { label: 'Subtotal', value: formatPrice(subtotal) },
    ]
    if (fulfillment === 'entrega') {
      rows.push({ label: 'Entrega', value: fee === 0 ? 'Grátis' : formatPrice(fee) })
    }
    rows.push({ label: 'Total', value: formatPrice(total), strong: true })
    rows.push({ label: 'Receber', value: fulfillment === 'entrega' ? 'Entrega' : 'Retirada na loja' })
    if (s.address) rows.push({ label: 'Endereço', value: s.address })
    rows.push({ label: 'Pagamento', value: `${order.payment}${s.change ? `, ${s.change}` : ''}` })
    if (s.notes) rows.push({ label: 'Observações', value: s.notes })

    await say('Confira se está tudo certo. Ao tocar em enviar, o WhatsApp abre com o pedido pronto.', {
      card: { title: `Pedido de ${firstName()}`, rows },
      options: [
        { label: '📲 Enviar pedido no WhatsApp', value: 'send', href: url },
        { label: '➕ Adicionar itens', value: 'order' },
        { label: '❌ Cancelar pedido', value: 'cancel' },
      ],
    })
  }

  async function onConfirm(value: string) {
    if (value === 'send') {
      setStep('done')
      cartRef.current.clear()
      const url = session.current.lastUrl
      await say(
        `Pronto, ${firstName()}! 🎉 Abri o WhatsApp com o seu pedido preenchido. É só tocar em enviar. Nossa equipe confirma o tempo de entrega por lá.`,
        {
          options: [
            ...(url ? [{ label: '📲 Abrir o WhatsApp de novo', value: 'reopen', href: url }] : []),
            { label: '🍕 Fazer outro pedido', value: 'order' },
            { label: '🏠 Menu inicial', value: 'menu' },
          ],
        },
      )
      return
    }
    if (value === 'cancel') {
      cartRef.current.clear()
      await say('Pedido cancelado. Sem problemas!')
      return showMenu()
    }
    return fallback()
  }

  async function onDone(value: string) {
    if (value === 'reopen') {
      const url = session.current.lastUrl
      await say('Abri de novo. Se o WhatsApp não carregar, toque no botão mais uma vez.', {
        options: [
          ...(url ? [{ label: '📲 Abrir o WhatsApp de novo', value: 'reopen', href: url }] : []),
          { label: '🍕 Fazer outro pedido', value: 'order' },
          { label: '🏠 Menu inicial', value: 'menu' },
        ],
      })
      return
    }
    return fallback()
  }

  async function fallback() {
    const options = lastOptions.current.length > 0 ? lastOptions.current : MENU_OPTIONS
    await say('Não entendi muito bem. 😅 Escolha uma das opções abaixo:', { options })
  }

  // ---------- Roteamento ----------

  /** Respostas por botão. Alguns valores valem em qualquer etapa. */
  async function route(value: string) {
    if (value === 'menu') return showMenu()
    if (value === 'order') return askCategory()
    if (value === 'catalog') return goCatalog()
    if (value === 'info') return showInfo()
    if (value === 'human') return human()

    switch (stepRef.current) {
      case 'category':
        return onCategory(value)
      case 'product':
        return onProduct(value)
      case 'variant':
        return onVariant(value)
      case 'qty':
        return onQty(value)
      case 'after_add':
        return onAfterAdd(value)
      case 'fulfillment':
        return onFulfillment(value)
      case 'payment':
        return onPayment(value)
      case 'change':
        return onChange(value)
      case 'notes':
        return onNotes(value)
      case 'confirm':
        return onConfirm(value)
      case 'done':
        return onDone(value)
      default:
        return showMenu()
    }
  }

  /** Respostas digitadas. */
  async function routeText(text: string) {
    const current = stepRef.current
    const normalized = normalize(text)

    switch (current) {
      case 'ask_name':
        return onName(text)

      case 'menu':
      case 'category':
      case 'product':
      case 'after_add': {
        const product = findProduct(text)
        if (product) return selectProduct(product)
        if (current === 'menu') {
          const intent = matchMenuIntent(normalized)
          if (intent) return route(intent)
        }
        if (current === 'after_add' && /finaliz|fechar|so isso|so ele|pronto/.test(normalized)) {
          return route('checkout')
        }
        return fallback()
      }

      case 'qty': {
        const qty = parseInt(text, 10)
        if (Number.isInteger(qty) && qty >= 1 && qty <= 20) return addCurrent(qty)
        await say('Digite um número de 1 a 20, por favor. 🙂')
        return
      }

      case 'fulfillment':
        if (/entreg|casa/.test(normalized)) return route('entrega')
        if (/retir|busc/.test(normalized)) return route('retirada')
        return fallback()

      case 'address':
        return onAddress(text)

      case 'payment':
        if (/pix/.test(normalized)) return route('pix')
        if (/cart|cred|deb/.test(normalized)) return route('card')
        if (/dinh|especie/.test(normalized)) return route('cash')
        return fallback()

      case 'change':
        return onChangeText(text)

      case 'notes':
        return onNotes(/^(nao|nada|sem observa)/.test(normalized) ? 'no-notes' : text)

      default:
        return fallback()
    }
  }

  // ---------- API pública do hook ----------

  function pick(option: ChatOption) {
    void run(async () => {
      userSay(option.label)
      await route(option.value)
    })
  }

  function send(raw: string) {
    const text = raw.trim()
    if (!text) return
    void run(async () => {
      userSay(text)
      await routeText(text)
    })
  }

  /** Chamado sempre que o painel do chat é aberto. */
  function onOpen(intent?: ChatIntent) {
    if (!startedRef.current) {
      startedRef.current = true
      session.current.pendingIntent = intent
      void run(greet)
      return
    }
    if (intent === 'checkout') {
      if (!session.current.name) {
        session.current.pendingIntent = 'checkout'
        return
      }
      void run(startCheckout)
    }
  }

  function reset() {
    if (busyRef.current) return
    setMessages([])
    session.current = { name: session.current.name }
    lastOptions.current = []
    startedRef.current = true
    void run(async () => {
      if (session.current.name) await showMenu(`Conversa reiniciada, Como posso ajudar?`)
      else await greet()
    })
  }

  return { messages, typing, step, onOpen, send, pick, reset }
}
