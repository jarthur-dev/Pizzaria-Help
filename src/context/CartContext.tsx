import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getProduct } from '../data/products'
import type { CartItem, Product, Variant } from '../types'
import { round2 } from '../utils/format'

const STORAGE_KEY = 'pizzaria-help:cart:v1'
const MAX_QTY = 20

export interface CartLine {
  item: CartItem
  product: Product
  variant: Variant
  total: number
}

interface CartValue {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (productId: string, variantId: string, qty?: number) => void
  setQty: (productId: string, variantId: string, qty: number) => void
  remove: (productId: string, variantId: string) => void
  clear: () => void
}

const CartContext = createContext<CartValue | null>(null)

function isValidItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  if (typeof item.productId !== 'string' || typeof item.variantId !== 'string') return false
  if (typeof item.qty !== 'number' || item.qty < 1) return false
  const product = getProduct(item.productId)
  return Boolean(product && product.variants.some((variant) => variant.id === item.variantId))
}

function loadItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValidItem) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadItems)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* armazenamento indisponível: o carrinho continua funcionando em memória */
    }
  }, [items])

  const add = useCallback((productId: string, variantId: string, qty = 1) => {
    setItems((prev) => {
      const index = prev.findIndex((it) => it.productId === productId && it.variantId === variantId)
      if (index === -1) return [...prev, { productId, variantId, qty: Math.min(qty, MAX_QTY) }]
      return prev.map((it, i) => (i === index ? { ...it, qty: Math.min(it.qty + qty, MAX_QTY) } : it))
    })
  }, [])

  const remove = useCallback((productId: string, variantId: string) => {
    setItems((prev) => prev.filter((it) => !(it.productId === productId && it.variantId === variantId)))
  }, [])

  const setQty = useCallback(
    (productId: string, variantId: string, qty: number) => {
      if (qty <= 0) {
        remove(productId, variantId)
        return
      }
      setItems((prev) =>
        prev.map((it) =>
          it.productId === productId && it.variantId === variantId ? { ...it, qty: Math.min(qty, MAX_QTY) } : it,
        ),
      )
    },
    [remove],
  )

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<CartValue>(() => {
    const lines: CartLine[] = []
    for (const item of items) {
      const product = getProduct(item.productId)
      const variant = product?.variants.find((v) => v.id === item.variantId)
      if (product && variant) {
        lines.push({ item, product, variant, total: round2(variant.price * item.qty) })
      }
    }
    const count = lines.reduce((sum, line) => sum + line.item.qty, 0)
    const subtotal = round2(lines.reduce((sum, line) => sum + line.total, 0))
    return { lines, count, subtotal, add, setQty, remove, clear }
  }, [items, add, setQty, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return value
}
