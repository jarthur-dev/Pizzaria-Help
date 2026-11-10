import { useEffect } from 'react'
import { BUSINESS } from '../config'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'
import { variantTitle } from '../data/products'
import { formatPrice } from '../utils/format'
import { Icon } from './Icon'

export function CartDrawer() {
  const { cartOpen, closeCart, openChat } = useUI()
  const { lines, subtotal, count, setQty, remove, clear } = useCart()

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cartOpen, closeCart])

  const freeAbove = BUSINESS.freeDeliveryAbove
  const missing = Math.max(0, freeAbove - subtotal)
  const progress = Math.min(1, subtotal / freeAbove)

  return (
    <div className={`drawer${cartOpen ? ' is-open' : ''}`}>
      <div className="drawer__overlay" onClick={closeCart} />
      <aside className="drawer__panel" role="dialog" aria-modal="true" aria-label="Seu pedido">
        <header className="drawer__head">
          <h2>Seu pedido</h2>
          <button type="button" className="icon-btn" onClick={closeCart} aria-label="Fechar pedido">
            <Icon name="close" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="drawer__empty">
            <h3>Seu pedido está vazio</h3>
            <p>Adicione itens do cardápio ou peça direto pelo chat.</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                closeCart()
                openChat()
              }}
            >
              <Icon name="chat" size={18} />
              Pedir pelo chat
            </button>
          </div>
        ) : (
          <>
            <div className="drawer__ship">
              <p>
                {missing > 0
                  ? `Faltam ${formatPrice(missing)} para a entrega ficar grátis.`
                  : 'Entrega grátis garantida neste pedido.'}
              </p>
              <div className="bar" aria-hidden="true">
                <span style={{ width: `${progress * 100}%` }} />
              </div>
            </div>

            <ul className="drawer__list">
              {lines.map((line) => (
                <li key={`${line.item.productId}:${line.item.variantId}`} className="line">
                  <div className="line__info">
                    <strong>{line.product.name}</strong>
                    {line.product.variants.length > 1 && <span>{variantTitle(line.variant)}</span>}
                    <span className="line__price">{formatPrice(line.total)}</span>
                  </div>
                  <div className="stepper">
                    <button
                      type="button"
                      onClick={() => setQty(line.item.productId, line.item.variantId, line.item.qty - 1)}
                      aria-label={`Diminuir ${line.product.name}`}
                    >
                      <Icon name={line.item.qty === 1 ? 'trash' : 'minus'} size={16} />
                    </button>
                    <span aria-live="polite">{line.item.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.item.productId, line.item.variantId, line.item.qty + 1)}
                      aria-label={`Aumentar ${line.product.name}`}
                    >
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="line__remove"
                    onClick={() => remove(line.item.productId, line.item.variantId)}
                    aria-label={`Remover ${line.product.name}`}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="drawer__foot">
              <div className="drawer__total">
                <span>
                  Subtotal ({count} {count === 1 ? 'item' : 'itens'})
                </span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--lg btn--block"
                onClick={() => {
                  closeCart()
                  openChat('checkout')
                }}
              >
                <Icon name="chat" size={20} />
                Finalizar pelo chat
              </button>
              <div className="drawer__links">
                <button type="button" className="link-btn" onClick={closeCart}>
                  Continuar escolhendo
                </button>
                <button type="button" className="link-btn" onClick={clear}>
                  Esvaziar pedido
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
