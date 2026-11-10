import { useEffect, useState } from 'react'
import { useUI } from '../context/UIContext'
import { getProduct } from '../data/products'
import { deliveryFeeFor, formatPrice } from '../utils/format'
import { Icon } from './Icon'

/**
 * Conversa de exemplo que se escreve sozinha quando a página abre.
 * É o único movimento "automático" da página: mostra, em 8 segundos, como o pedido funciona.
 * Os valores vêm do próprio cardápio, então sempre batem com os preços reais.
 */

interface Step {
  from: 'bot' | 'user'
  at: number
  text: string
  card?: boolean
  chips?: boolean
  cta?: boolean
}

function buildScript() {
  const pizza = getProduct('calabresa')
  const drink = getProduct('coca-cola')
  const pizzaSize = pizza?.variants.find((v) => v.id === 'grande')
  const drinkSize = drink?.variants.find((v) => v.id === '2l')
  if (!pizza || !drink || !pizzaSize || !drinkSize) return null

  const subtotal = pizzaSize.price + drinkSize.price
  const total = subtotal + deliveryFeeFor(subtotal)

  const rows = [
    { label: `1x ${pizza.name} (${pizzaSize.label})`, value: formatPrice(pizzaSize.price) },
    { label: `1x ${drink.name} (${drinkSize.label})`, value: formatPrice(drinkSize.price) },
    { label: 'Subtotal', value: formatPrice(subtotal), strong: true },
  ]

  const steps: Step[] = [
    { from: 'bot', at: 1000, text: 'Oi! Eu sou a Help. O que vai ser hoje?' },
    { from: 'user', at: 2900, text: 'Uma calabresa grande e uma coca de 2 litros' },
    { from: 'bot', at: 4700, text: 'Anotado! Você prefere entrega ou retirada?', card: true, chips: true },
    { from: 'user', at: 6300, text: '🛵 Entrega' },
    { from: 'bot', at: 8000, text: `Total com entrega: ${formatPrice(total)}. É só enviar para o WhatsApp.`, cta: true },
  ]
  return { rows, steps }
}

export function HeroDemo() {
  const { openChat } = useUI()
  const script = buildScript()
  const total = script?.steps.length ?? 0
  const [shown, setShown] = useState(0)
  const [typing, setTyping] = useState(false)

  useEffect(() => {
    if (!script) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(script.steps.length)
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    script.steps.forEach((step, index) => {
      if (step.from === 'bot') timers.push(setTimeout(() => setTyping(true), step.at - 750))
      timers.push(
        setTimeout(() => {
          setTyping(false)
          setShown(index + 1)
        }, step.at),
      )
    })
    return () => timers.forEach(clearTimeout)
    // O roteiro é montado uma única vez, a partir de dados estáticos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!script) return null
  const visible = script.steps.slice(0, shown)
  const finished = shown >= total

  return (
    <div className="demo">
      <div className="demo__head">
        <span className="chat__avatar" aria-hidden="true">
          🍕
        </span>
        <div>
          <strong>Help</strong>
          <span>Assistente da {`Pizzaria Help`}</span>
        </div>
        <span className="demo__live">
          <i aria-hidden="true" /> online
        </span>
      </div>

      <p className="sr-only">
        Exemplo de conversa: o cliente pede uma pizza de calabresa grande e uma Coca-Cola de 2 litros, escolhe entrega e
        envia o pedido pronto para o WhatsApp.
      </p>

      <div className="demo__body" aria-hidden="true">
        {visible.map((step, index) => (
          <div key={index} className={`msg msg--${step.from}`}>
            <div className="msg__body">
              <p className="bubble">{step.text}</p>
              {step.card && (
                <div className="msg-card">
                  <dl>
                    {script.rows.map((row) => (
                      <div key={row.label} className={row.strong ? 'is-strong' : undefined}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              {step.chips && index === shown - 1 && (
                <div className="chips">
                  <span className="chip">🛵 Entrega</span>
                  <span className="chip">🏪 Retirada</span>
                </div>
              )}
              {step.cta && <span className="chip chip--primary">📲 Enviar pedido no WhatsApp</span>}
            </div>
          </div>
        ))}
        {typing && (
          <div className="msg msg--bot">
            <div className="msg__body">
              <p className="bubble typing">
                <i />
                <i />
                <i />
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="demo__foot">
        <button type="button" className="btn btn--yellow btn--block" onClick={() => openChat()}>
          <Icon name="chat" size={18} />
          {finished ? 'Fazer o meu pedido agora' : 'Testar o chat de verdade'}
        </button>
      </div>
    </div>
  )
}
