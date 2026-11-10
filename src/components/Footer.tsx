import { BUSINESS } from '../config'
import { useUI } from '../context/UIContext'
import { formatPrice } from '../utils/format'
import { buildWhatsAppUrl } from '../utils/whatsapp'
import { Icon } from './Icon'

export function Footer() {
  const { openChat } = useUI()
  const whatsappUrl = buildWhatsAppUrl(`Olá! Vim pelo site da ${BUSINESS.name}.`)

  return (
    <footer className="footer" id="contato">
      <div className="container footer__grid" data-reveal>
        <div className="footer__brand">
          <span className="brand brand--light">
            <span className="brand__mark" aria-hidden="true">
              🍕
            </span>
            <span className="brand__name">
              Pizzaria <strong>Help</strong>
            </span>
          </span>
          <p>Pizza feita na hora, pedido em um minuto. Peça pelo chat e receba quentinha.</p>
          <button type="button" className="btn btn--yellow" onClick={() => openChat()}>
            <Icon name="chat" size={18} />
            Pedir pelo chat
          </button>
        </div>

        <div>
          <h3>Contato</h3>
          <ul className="footer__list">
            <li>
              <Icon name="phone" size={18} />
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp {BUSINESS.phoneDisplay}
              </a>
            </li>
            <li>
              <Icon name="pin" size={18} />
              {BUSINESS.address}
            </li>
            <li>
              <Icon name="chat" size={18} />
              Instagram {BUSINESS.instagram}
            </li>
          </ul>
        </div>

        <div>
          <h3>Funcionamento</h3>
          <ul className="footer__list">
            <li>
              <Icon name="clock" size={18} />
              {BUSINESS.hoursSummary}
            </li>
            <li>
              <Icon name="scooter" size={18} />
              Entrega em {BUSINESS.deliveryEta}. Grátis acima de {formatPrice(BUSINESS.freeDeliveryAbove)}.
            </li>
            <li>
              <Icon name="store" size={18} />
              Retirada em {BUSINESS.pickupEta}
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__legal">
        <span>
          © {new Date().getFullYear()} {BUSINESS.name}. Todos os direitos reservados.
        </span>
        <span>Venda de bebidas alcoólicas proibida para menores de 18 anos.</span>
      </div>
    </footer>
  )
}
