import { useUI } from '../context/UIContext'
import { Icon } from './Icon'

const STEPS = [
  {
    title: 'Escolha o que vai querer',
    text: 'Converse com a Help ou toque em Adicionar nos itens do cardápio.',
  },
  {
    title: 'Diga como quer receber',
    text: 'Entrega ou retirada, endereço e forma de pagamento: Pix, cartão ou dinheiro.',
  },
  {
    title: 'Envie pelo WhatsApp',
    text: 'O pedido vai pronto, com itens e total. Basta tocar em enviar.',
  },
  {
    title: 'Receba quentinha',
    text: 'A equipe confirma o tempo de entrega e a pizza sai do forno para você.',
  },
]

export function HowItWorks() {
  const { openChat } = useUI()

  return (
    <section className="section section--tint" id="como-pedir" aria-labelledby="como-pedir-title">
      <div className="container">
        <div className="section__head" data-reveal>
          <h2 id="como-pedir-title">Como pedir</h2>
          <p>Quatro passos, e o primeiro já pode ser feito agora.</p>
        </div>

        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="step" data-reveal>
              <span className="step__number" aria-hidden="true">
                {index + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="band" data-reveal>
          <div>
            <h3>Com fome? A Help anota o seu pedido agora.</h3>
            <p>Leva cerca de um minuto, do primeiro oi ao pedido enviado.</p>
          </div>
          <button type="button" className="btn btn--yellow btn--lg" onClick={() => openChat()}>
            <Icon name="chat" size={20} />
            Pedir pelo chat
          </button>
        </div>
      </div>
    </section>
  )
}
