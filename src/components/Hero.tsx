import { BUSINESS } from '../config'
import { useUI } from '../context/UIContext'
import { formatPrice } from '../utils/format'
import { HeroDemo } from './HeroDemo'
import { Icon } from './Icon'
import { PizzaArt } from './PizzaArt'
import type { Topping } from '../types'

const HERO_TOPPINGS: Topping[] = ['calabresa', 'mussarela', 'azeitona', 'manjericao', 'cebola']

export function Hero() {
  const { openChat } = useUI()

  return (
    <section className="hero" id="inicio">
      <div className="hero__pizza" aria-hidden="true">
        <PizzaArt toppings={HERO_TOPPINGS} seed="hero" />
      </div>

      <div className="container hero__grid">
        <div className="hero__copy">
          <h1>Peça pizza conversando. Ela chega quentinha.</h1>
          <p className="hero__lead">
            A Help anota o seu pedido, soma o total e envia tudo pronto para o WhatsApp da pizzaria. Sem fila e sem
            telefone ocupado.
          </p>

          <div className="hero__cta">
            <button type="button" className="btn btn--yellow btn--lg" onClick={() => openChat()}>
              <Icon name="chat" size={20} />
              Pedir pelo chat
            </button>
            <a className="btn btn--outline-light btn--lg" href="#cardapio">
              Ver o cardápio
            </a>
          </div>

          <ul className="hero__facts">
            <li>
              <Icon name="scooter" size={20} />
              Entrega em {BUSINESS.deliveryEta}, grátis acima de {formatPrice(BUSINESS.freeDeliveryAbove)}
            </li>
            <li>
              <Icon name="clock" size={20} />
              {BUSINESS.hoursSummary}
            </li>
          </ul>
        </div>

        <div className="hero__demo">
          <HeroDemo />
        </div>
      </div>
    </section>
  )
}
