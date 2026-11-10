import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useChatbot } from '../chat/useChatbot'
import type { ChatCard, ChatOption, Step } from '../chat/types'
import { useUI } from '../context/UIContext'
import { Icon } from './Icon'

const PLACEHOLDERS: Partial<Record<Step, string>> = {
  ask_name: 'Digite o seu nome',
  qty: 'Ou digite a quantidade',
  address: 'Rua, número, bairro e referência',
  change: 'Troco para quanto? Ex.: 100',
  notes: 'Digite a sua observação',
}

function MessageCard({ card }: { card: ChatCard }) {
  return (
    <div className="msg-card">
      <h4>{card.title}</h4>
      <dl>
        {card.rows.map((row, index) => (
          <div key={index} className={row.strong ? 'is-strong' : undefined}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

interface ChipProps {
  option: ChatOption
  onPick: (option: ChatOption) => void
}

function Chip({ option, onPick }: ChipProps) {
  const primary = option.value === 'send' ? ' chip--primary' : ''
  if (option.href) {
    return (
      <a
        className={`chip chip--link${primary}`}
        href={option.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onPick(option)}
      >
        {option.label}
      </a>
    )
  }
  return (
    <button type="button" className={`chip${primary}`} onClick={() => onPick(option)}>
      {option.label}
    </button>
  )
}

export function ChatBot() {
  const { chatOpen, chatRequest, closeChat } = useUI()
  const bot = useChatbot({ closeChat })
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Ao abrir: inicia a conversa (ou retoma o checkout) e foca o campo no computador.
  useEffect(() => {
    if (!chatOpen) return
    bot.onOpen(chatRequest?.intent)
    if (window.matchMedia('(min-width: 721px)').matches) {
      const timer = setTimeout(() => inputRef.current?.focus(), 250)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, chatRequest])

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }, [bot.messages, bot.typing])

  useEffect(() => {
    if (!chatOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeChat()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chatOpen, closeChat])

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!draft.trim() || bot.typing) return
    bot.send(draft)
    setDraft('')
  }

  const lastIndex = bot.messages.length - 1

  return (
    <section className={`chat${chatOpen ? ' is-open' : ''}`} role="dialog" aria-label="Chat de pedidos da Pizzaria Help">
      <header className="chat__head">
        <span className="chat__avatar" aria-hidden="true">
          🍕
        </span>
        <div className="chat__title">
          <strong>Help</strong>
          <span>Assistente da Pizzaria Help</span>
        </div>
        <button type="button" className="icon-btn icon-btn--light" onClick={bot.reset} aria-label="Reiniciar conversa">
          <Icon name="refresh" size={18} />
        </button>
        <button type="button" className="icon-btn icon-btn--light" onClick={closeChat} aria-label="Fechar chat">
          <Icon name="close" size={20} />
        </button>
      </header>

      <div className="chat__list" ref={listRef} role="log" aria-live="polite" aria-label="Conversa">
        {bot.messages.map((message, index) => (
          <div key={message.id} className={`msg msg--${message.from}`}>
            {message.from === 'bot' && (
              <span className="msg__avatar" aria-hidden="true">
                🍕
              </span>
            )}
            <div className="msg__body">
              {message.text && <p className="bubble">{message.text}</p>}
              {message.card && <MessageCard card={message.card} />}
              {index === lastIndex && message.from === 'bot' && message.options && !bot.typing && (
                <div className="chips" role="group" aria-label="Respostas rápidas">
                  {message.options.map((option) => (
                    <Chip key={option.value + option.label} option={option} onPick={bot.pick} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {bot.typing && (
          <div className="msg msg--bot">
            <span className="msg__avatar" aria-hidden="true">
              🍕
            </span>
            <div className="msg__body">
              <p className="bubble typing" aria-label="A Help está digitando">
                <i />
                <i />
                <i />
              </p>
            </div>
          </div>
        )}
      </div>

      <form className="chat__form" onSubmit={onSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={PLACEHOLDERS[bot.step] ?? 'Escreva a sua mensagem'}
          aria-label="Mensagem para a Help"
          autoComplete="off"
          disabled={bot.typing}
        />
        <button type="submit" className="chat__send" disabled={bot.typing || !draft.trim()} aria-label="Enviar mensagem">
          <Icon name="send" size={20} />
        </button>
      </form>
      <p className="chat__note">Atendimento automático. O pedido é confirmado pela nossa equipe no WhatsApp.</p>
    </section>
  )
}
