import { BUSINESS } from '../config'
import { formatPrice } from '../utils/format'
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

export function Faq() {
  return (
    <section className="section" id="duvidas" aria-labelledby="duvidas-title">
      <div className="container container--narrow">
        <div className="section__head">
          <h2 id="duvidas-title">Dúvidas frequentes</h2>
        </div>

        <div className="faq">
          {FAQS.map((item) => (
            <details key={item.q} className="faq__item">
              <summary>
                {item.q}
                <Icon name="down" size={20} className="faq__chevron" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
