import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChatIntent } from '../chat/types'

interface ChatRequest {
  id: number
  intent?: ChatIntent
}

interface UIValue {
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
  chatOpen: boolean
  chatRequest: ChatRequest | null
  openChat: (intent?: ChatIntent) => void
  closeChat: () => void
}

const UIContext = createContext<UIValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatRequest, setChatRequest] = useState<ChatRequest | null>(null)
  const requestId = useRef(0)

  const openCart = useCallback(() => setCartOpen(true), [])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const closeChat = useCallback(() => setChatOpen(false), [])

  const openChat = useCallback((intent?: ChatIntent) => {
    requestId.current += 1
    setChatRequest({ id: requestId.current, intent })
    setCartOpen(false)
    setChatOpen(true)
  }, [])

  // Trava a rolagem da página atrás do carrinho (sempre) e do chat (só no celular, via CSS).
  useEffect(() => {
    document.body.classList.toggle('lock-cart', cartOpen)
    document.body.classList.toggle('lock-chat', chatOpen)
  }, [cartOpen, chatOpen])

  const value = useMemo<UIValue>(
    () => ({ cartOpen, openCart, closeCart, chatOpen, chatRequest, openChat, closeChat }),
    [cartOpen, openCart, closeCart, chatOpen, chatRequest, openChat, closeChat],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIValue {
  const value = useContext(UIContext)
  if (!value) throw new Error('useUI precisa estar dentro de <UIProvider>')
  return value
}
