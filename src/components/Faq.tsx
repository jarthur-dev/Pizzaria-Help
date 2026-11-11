import { useRef } from 'react'
import type { MouseEvent } from 'react'
import { BUSINESS } from '../config'
import { formatPrice } from '../utils/format'
import { EASE_OUT, gentle } from '../utils/motion'
import { Icon } from './Icon'

const FAQS = [
  {
    q: 'Como funciona o pedido pelo chat?',
    a: 'A Help te guia: você escolhe os itens, diz se quer entrega ou retirada, informa o endereço e a forma de pagamento. No final, o pedido vai preenchido para o nosso WhatsApp e a equipe confirma tudo com você.',
  },
  {
    q: 'Qual o tempo e a taxa de entrega?',
    a: `A entrega leva em média ${BUSINESS.deliveryEta}. A taxa é de ${formatPrice(BUSINESS.deliveryFee)} e fica grátis em pedidos a partir de ${formatPrice(BUSINESS.freeDeliveryAbove)}.`,
  },
  {
    q: 'Posso retirar na loja?',
    a: `Pode. Escolha Retirada no chat e o pedido fica pronto em ${BUSINESS.pickupEta}. Endereço: ${BUSINESS.address}.`,
  },
  {
    q: 'Quais são as formas de pagamento?',
    a: 'Pix, cartão ou dinheiro. Se for pagar em dinheiro, avise no chat se precisa de troco.',
  },
  {
    q: 'Posso trocar o sabor do combo ou tirar um ingrediente?',
    a: 'Pode. No final do pedido a Help pergunta se você tem alguma observação. É lá que você avisa, por exemplo, "sem cebola" ou "combo com pizza de frango".',
  },
  {
    q: 'Qual o horário de funcionamento?',
    a: `${BUSINESS.hoursSummary}. Fora desse horário você ainda pode montar o pedido, e a equipe responde assim que abrir.`,
  },
]

/** <details> com abertura e fechamento animados (altura e seta), em vez de aparecer de uma vez. */
function FaqItem({ q, a }: { q: string; a: string }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const animation = useRef<Animation | null>(null)

  const toggle = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    const el = ref.current
    if (!el) return

    const opening = !el.open
    el.dataset.expanded = String(opening)

    animation.current?.cancel()
    const startHeight = el.offsetHeight
    el.style.overflow = 'hidden'
    if (opening) el.open = true
    const summary = el.firstElementChild as HTMLElement
    const endHeight = opening ? el.offsetHeight : summary.offsetHeight + (el.offsetHeight - el.clientHeight)

    const run = el.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], {
      duration: gentle(420),
      easing: EASE_OUT,
    })
    animation.current = run

    const done = () => {
      if (animation.current !== run) return
      animation.current = null
      el.open = opening
      el.style.overflow = ''
    }
    run.onfinish = done
    run.oncancel = () => {
      if (animation.current === run) animation.current = null
    }
  }

  return (
    <details ref={ref} className="faq__item" data-expanded="false">
      <summary onClick={toggle}>
        {q}
        <Icon name="down" size={20} className="faq__chevron" />
      </summary>
      <p>{a}</p>
    </details>
  )
}

export function Faq() {
  return (
    <section className="section" id="duvidas" aria-labelledby="duvidas-title">
      <div className="container container--narrow">
        <div className="section__head" data-reveal>
          <h2 id="duvidas-title">Dúvidas frequentes</h2>
        </div>

        <div className="faq" data-reveal>
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
