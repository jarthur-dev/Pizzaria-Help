import { useEffect, useState } from 'react'
import { BUSINESS } from '../config'
import { useCart } from '../context/CartContext'
import { useUI } from '../context/UIContext'
import { useOpenStatus } from '../hooks/useOpenStatus'
import { Icon } from './Icon'

const LINKS = [
  { href: '#destaques', label: 'Destaques' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#como-pedir', label: 'Como pedir' },
  { href: '#duvidas', label: 'Dúvidas' },
  { href: '#contato', label: 'Contato' },
]

export function Header() {
  const { count } = useCart()
  const { openCart, openChat } = useUI()
  const open = useOpenStatus()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header__inner">
        <a className="brand" href="#inicio" aria-label={`${BUSINESS.name}, início`}>
          <span className="brand__mark" aria-hidden="true">
            🍕
          </span>
          <span className="brand__name">
            Pizzaria <strong>Help</strong>
          </span>
        </a>

        <nav id="menu-principal" className={`nav${menuOpen ? ' is-open' : ''}`} aria-label="Principal">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <span className={`status ${open ? 'status--open' : 'status--closed'}`}>
            <i aria-hidden="true" />
            {open ? 'Aberto agora' : 'Fechado agora'}
          </span>

          <button
            type="button"
            className="icon-btn"
            onClick={openCart}
            aria-label={count > 0 ? `Abrir pedido, ${count} ${count === 1 ? 'item' : 'itens'}` : 'Abrir pedido'}
          >
            <Icon name="cart" />
            {count > 0 && <span className="badge">{count}</span>}
          </button>

          <button type="button" className="btn btn--primary btn--sm header__cta" onClick={() => openChat()}>
            <Icon name="chat" size={16} />
            Pedir no chat
          </button>

          <button
            type="button"
            className="icon-btn nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
  )
}
