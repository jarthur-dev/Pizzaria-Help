import { useEffect, useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import { TAG_LABELS } from '../data/products'
import type { Product } from '../types'
import { formatPrice } from '../utils/format'
import { Icon } from './Icon'
import { ProductArt } from './ProductArt'

interface ProductCardProps {
  product: Product
  /** Texto da faixa de destaque, ex.: "Destaque da semana". */
  ribbon?: string
  /** Versão usada no carrossel (a ilustração "salta" para fora do card). */
  featured?: boolean
}

export function ProductCard({ product, ribbon, featured = false }: ProductCardProps) {
  const { add } = useCart()
  const hasSizes = product.variants.length > 1
  // Pizzas começam no tamanho "Grande"; demais produtos, no primeiro.
  const defaultIndex = hasSizes && (product.category === 'salgadas' || product.category === 'doces') ? 1 : 0
  const [variantId, setVariantId] = useState(product.variants[defaultIndex].id)
  const [added, setAdded] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0]

  const handleAdd = () => {
    add(product.id, variant.id, 1)
    setAdded(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setAdded(false), 1400)
  }

  return (
    <article className={`card${featured ? ' card--featured' : ''}`}>
      <ProductArt product={product} />
      {ribbon && <span className="card__ribbon">{ribbon}</span>}

      <div className="card__body">
        {product.tags.length > 0 && (
          <ul className="card__tags">
            {product.tags.map((tag) => (
              <li key={tag} className={`tag tag--${tag}`}>
                {TAG_LABELS[tag]}
              </li>
            ))}
          </ul>
        )}

        <h3 className="card__title">{product.name}</h3>
        <p className="card__desc">{product.description}</p>

        {hasSizes && (
          <div className="sizes" role="group" aria-label={`Tamanho de ${product.name}`}>
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`size${v.id === variant.id ? ' is-active' : ''}`}
                aria-pressed={v.id === variant.id}
                onClick={() => setVariantId(v.id)}
              >
                <span>{v.label}</span>
                {v.note && <small>{v.note}</small>}
              </button>
            ))}
          </div>
        )}

        <div className="card__foot">
          <strong className="price">{formatPrice(variant.price)}</strong>
          <button type="button" className={`btn btn--primary btn--sm${added ? ' is-added' : ''}`} onClick={handleAdd}>
            <Icon name={added ? 'check' : 'plus'} size={16} />
            {added ? 'Adicionado' : 'Adicionar'}
          </button>
        </div>
        <span className="sr-only" aria-live="polite">
          {added ? `${product.name} adicionado ao pedido` : ''}
        </span>
      </div>
    </article>
  )
}
