export type Category = 'salgadas' | 'doces' | 'bebidas' | 'combos'

export type Tag = 'vegetariana' | 'picante' | 'mais-pedida' | 'novidade'

/** Ingredientes usados para desenhar a pizza em SVG (ver PizzaArt). */
export type Topping =
  | 'calabresa'
  | 'pepperoni'
  | 'mussarela'
  | 'tomate'
  | 'manjericao'
  | 'azeitona'
  | 'cebola'
  | 'bacon'
  | 'frango'
  | 'milho'
  | 'cogumelo'
  | 'pimentao'
  | 'presunto'
  | 'catupiry'
  | 'chocolate'
  | 'morango'
  | 'banana'
  | 'confete'
  | 'goiabada'

export interface Variant {
  id: string
  label: string
  /** Detalhe curto exibido junto do rótulo, ex.: "8 fatias" ou "350 ml". */
  note?: string
  price: number
}

export interface Product {
  id: string
  name: string
  description: string
  category: Category
  variants: Variant[]
  tags: Tag[]
  /** Pizzas: ingredientes desenhados na ilustração. */
  toppings?: Topping[]
  /** Bebidas e combos: emoji exibido no lugar da ilustração. */
  emoji?: string
  /** Quando existir uma foto real, ela substitui a ilustração. */
  image?: string
  highlight?: 'semana' | 'mes'
}

export interface CartItem {
  productId: string
  variantId: string
  qty: number
}
