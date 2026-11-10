import type { Product } from '../types'
import { PizzaArt } from './PizzaArt'
import type { PizzaBase } from './PizzaArt'

/** Foto (se existir), pizza desenhada ou emoji, conforme o tipo de produto. */
export function ProductArt({ product }: { product: Product }) {
  if (product.image) {
    return (
      <div className="art art--photo">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
    )
  }

  if (product.toppings) {
    let base: PizzaBase = 'tomato'
    if (product.category === 'doces') {
      base = product.toppings.includes('chocolate') ? 'chocolate' : 'cheese'
    }
    return (
      <div className={`art art--${product.category}`}>
        <PizzaArt toppings={product.toppings} seed={product.id} base={base} />
      </div>
    )
  }

  return (
    <div className={`art art--${product.category}`}>
      <span className="art__emoji" aria-hidden="true">
        {product.emoji ?? '🍕'}
      </span>
    </div>
  )
}
