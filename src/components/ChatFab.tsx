import { useEffect, useState } from 'react'
import { useUI } from '../context/UIContext'
import { Icon } from './Icon'

/** Botão flutuante que abre o chat. Some enquanto o chat está aberto. */
export function ChatFab() {
  const { chatOpen, openChat } = useUI()
  const [tip, setTip] = useState(false)

  // Um único convite, depois de alguns segundos, para quem ainda não abriu o chat.
  useEffect(() => {
    const show = setTimeout(() => setTip(true), 6000)
    const hide = setTimeout(() => setTip(false), 16000)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [])

  if (chatOpen) return null

  return (
    <div className="fab-wrap">
      {tip && (
        <div className="fab__tip" role="status">
          Posso anotar o seu pedido?
          <button type="button" onClick={() => setTip(false)} aria-label="Fechar aviso">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}
      <button
        type="button"
        className="fab"
        onClick={() => {
          setTip(false)
          openChat()
        }}
        aria-label="Abrir chat de pedidos"
      >
        <Icon name="chat" size={24} />
        <span className="fab__label">Pedir pelo chat</span>
      </button>
    </div>
  )
}
