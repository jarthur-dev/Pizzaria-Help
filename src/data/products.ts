import type { Category, Product, Tag, Variant } from '../types'
import { normalize } from '../utils/text'

/**
 * EXEMPLO: cardápio de demonstração. Quando o banco de dados estiver pronto,
 * esta lista pode ser substituída por uma chamada à API mantendo o mesmo formato.
 * Para usar fotos reais, preencha `image` em cada produto.
 */

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'salgadas', label: 'Pizzas salgadas', emoji: '🍕' },
  { id: 'doces', label: 'Pizzas doces', emoji: '🍫' },
  { id: 'bebidas', label: 'Bebidas', emoji: '🥤' },
  { id: 'combos', label: 'Combos', emoji: '🎁' },
]

export const TAG_LABELS: Record<Tag, string> = {
  vegetariana: 'Vegetariana',
  picante: 'Picante',
  'mais-pedida': 'Mais pedida',
  novidade: 'Novidade',
}

const pizzaSizes = (media: number, grande: number, familia: number): Variant[] => [
  { id: 'media', label: 'Média', note: '6 fatias', price: media },
  { id: 'grande', label: 'Grande', note: '8 fatias', price: grande },
  { id: 'familia', label: 'Família', note: '12 fatias', price: familia },
]

const single = (price: number, label = 'Único'): Variant[] => [{ id: 'unico', label, price }]

export const PRODUCTS: Product[] = [
  // Pizzas salgadas
  {
    id: 'margherita',
    name: 'Margherita',
    category: 'salgadas',
    description: 'Molho de tomate, mussarela, tomate fatiado e manjericão fresco.',
    variants: pizzaSizes(39.9, 54.9, 72.9),
    tags: ['vegetariana', 'mais-pedida'],
    toppings: ['mussarela', 'tomate', 'manjericao'],
    highlight: 'semana',
  },
  {
    id: 'calabresa',
    name: 'Calabresa',
    category: 'salgadas',
    description: 'Calabresa fatiada, cebola, azeitonas e mussarela.',
    variants: pizzaSizes(41.9, 56.9, 74.9),
    tags: ['mais-pedida'],
    toppings: ['calabresa', 'cebola', 'azeitona'],
    highlight: 'mes',
  },
  {
    id: 'frango-catupiry',
    name: 'Frango com Catupiry',
    category: 'salgadas',
    description: 'Frango desfiado temperado, catupiry cremoso e milho.',
    variants: pizzaSizes(44.9, 59.9, 79.9),
    tags: [],
    toppings: ['frango', 'catupiry', 'milho'],
    highlight: 'semana',
  },
  {
    id: 'portuguesa',
    name: 'Portuguesa',
    category: 'salgadas',
    description: 'Presunto, ovos, cebola, ervilha, azeitonas e mussarela.',
    variants: pizzaSizes(45.9, 61.9, 81.9),
    tags: [],
    toppings: ['presunto', 'cebola', 'azeitona', 'mussarela'],
  },
  {
    id: 'quatro-queijos',
    name: 'Quatro Queijos',
    category: 'salgadas',
    description: 'Mussarela, provolone, parmesão e catupiry.',
    variants: pizzaSizes(47.9, 63.9, 84.9),
    tags: ['vegetariana'],
    toppings: ['mussarela', 'catupiry'],
    highlight: 'mes',
  },
  {
    id: 'bacon-crocante',
    name: 'Bacon Crocante',
    category: 'salgadas',
    description: 'Mussarela, bacon crocante, cebola caramelizada e orégano.',
    variants: pizzaSizes(46.9, 62.9, 83.9),
    tags: ['novidade'],
    toppings: ['bacon', 'cebola', 'mussarela'],
    highlight: 'semana',
  },
  {
    id: 'pepperoni-picante',
    name: 'Pepperoni Picante',
    category: 'salgadas',
    description: 'Pepperoni, pimenta calabresa, mussarela e molho especial.',
    variants: pizzaSizes(49.9, 66.9, 88.9),
    tags: ['picante'],
    toppings: ['pepperoni', 'mussarela'],
    highlight: 'semana',
  },
  {
    id: 'vegetariana',
    name: 'Vegetariana',
    category: 'salgadas',
    description: 'Cogumelos, pimentão, tomate, cebola, azeitonas e mussarela.',
    variants: pizzaSizes(43.9, 58.9, 77.9),
    tags: ['vegetariana'],
    toppings: ['cogumelo', 'pimentao', 'tomate', 'azeitona'],
    highlight: 'mes',
  },

  // Pizzas doces
  {
    id: 'chocolate-morango',
    name: 'Chocolate com Morango',
    category: 'doces',
    description: 'Chocolate ao leite cremoso coberto com morangos.',
    variants: pizzaSizes(42.9, 57.9, 75.9),
    tags: ['vegetariana', 'mais-pedida'],
    toppings: ['chocolate', 'morango'],
    highlight: 'mes',
  },
  {
    id: 'banana-canela',
    name: 'Banana com Canela',
    category: 'doces',
    description: 'Banana, açúcar, canela e mussarela gratinada.',
    variants: pizzaSizes(38.9, 52.9, 69.9),
    tags: ['vegetariana'],
    toppings: ['banana', 'mussarela'],
  },
  {
    id: 'romeu-julieta',
    name: 'Romeu e Julieta',
    category: 'doces',
    description: 'Mussarela e goiabada derretida.',
    variants: pizzaSizes(40.9, 54.9, 71.9),
    tags: ['vegetariana'],
    toppings: ['mussarela', 'goiabada'],
  },
  {
    id: 'confete',
    name: 'Chocolate com Confete',
    category: 'doces',
    description: 'Chocolate ao leite com confeitos coloridos.',
    variants: pizzaSizes(41.9, 55.9, 73.9),
    tags: ['vegetariana', 'novidade'],
    toppings: ['chocolate', 'confete'],
  },

  // Bebidas
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    category: 'bebidas',
    description: 'Refrigerante gelado.',
    variants: [
      { id: 'lata', label: 'Lata', note: '350 ml', price: 6.5 },
      { id: '1l', label: '1 litro', price: 9.5 },
      { id: '2l', label: '2 litros', price: 14 },
    ],
    tags: ['mais-pedida'],
    emoji: '🥤',
  },
  {
    id: 'guarana',
    name: 'Guaraná',
    category: 'bebidas',
    description: 'Refrigerante gelado.',
    variants: [
      { id: 'lata', label: 'Lata', note: '350 ml', price: 5.9 },
      { id: '2l', label: '2 litros', price: 11.9 },
    ],
    tags: [],
    emoji: '🥤',
  },
  {
    id: 'suco-laranja',
    name: 'Suco de Laranja',
    category: 'bebidas',
    description: 'Suco natural, feito na hora.',
    variants: [
      { id: 'copo', label: 'Copo', note: '400 ml', price: 9.9 },
      { id: 'jarra', label: 'Jarra', note: '1 litro', price: 18.9 },
    ],
    tags: ['vegetariana'],
    emoji: '🍊',
  },
  {
    id: 'agua',
    name: 'Água Mineral',
    category: 'bebidas',
    description: 'Garrafa de 500 ml.',
    variants: [
      { id: 'sem-gas', label: 'Sem gás', price: 3.5 },
      { id: 'com-gas', label: 'Com gás', price: 4 },
    ],
    tags: [],
    emoji: '💧',
  },
  {
    id: 'cerveja',
    name: 'Cerveja Long Neck',
    category: 'bebidas',
    description: 'Long neck de 355 ml, bem gelada. Venda proibida para menores de 18 anos.',
    variants: single(9.9),
    tags: [],
    emoji: '🍺',
  },

  // Combos
  {
    id: 'combo-solteiro',
    name: 'Combo Solteiro',
    category: 'combos',
    description: 'Pizza média de margherita e uma Coca-Cola lata.',
    variants: single(42.9),
    tags: [],
    emoji: '🍕🥤',
  },
  {
    id: 'combo-casal',
    name: 'Combo Casal',
    category: 'combos',
    description: 'Pizza grande de calabresa e Coca-Cola 2 litros. Quer outro sabor? Avise nas observações.',
    variants: single(64.9),
    tags: ['mais-pedida'],
    emoji: '🍕🥤',
    highlight: 'semana',
  },
  {
    id: 'combo-familia',
    name: 'Combo Família',
    category: 'combos',
    description: 'Duas pizzas grandes (calabresa e margherita) e Coca-Cola 2 litros.',
    variants: single(112.9),
    tags: [],
    emoji: '🍕🍕🥤',
    highlight: 'mes',
  },
]

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id)
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price))
}

export function variantTitle(variant: Variant): string {
  return variant.note ? `${variant.label} (${variant.note})` : variant.label
}

const STOPWORDS = new Set([
  'pizza', 'de', 'da', 'do', 'das', 'dos', 'quero', 'uma', 'um', 'com', 'sabor',
  'por', 'favor', 'pra', 'para', 'me', 'manda', 'mande', 'vai', 'ver', 'as', 'os',
])

/** Encontra um produto a partir de texto livre, ex.: "quero uma pizza de calabresa". */
export function findProduct(query: string): Product | undefined {
  const tokens = normalize(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
  if (tokens.length === 0) return undefined
  return PRODUCTS.find((product) => {
    const name = normalize(product.name)
    return tokens.every((token) => name.includes(token))
  })
}
