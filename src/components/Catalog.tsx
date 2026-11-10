import { useMemo, useRef, useState } from 'react'
import { useUI } from '../context/UIContext'
import { CATEGORIES, PRODUCTS, TAG_LABELS, minPrice } from '../data/products'
import type { Category, Tag } from '../types'
import { useFlip } from '../hooks/useFlip'
import { normalize } from '../utils/text'
import { Icon } from './Icon'
import { ProductCard } from './ProductCard'

type CategoryFilter = 'todas' | Category
type SortKey = 'relevancia' | 'menor' | 'maior' | 'az'

const TAG_FILTERS: Tag[] = ['vegetariana', 'picante', 'mais-pedida']

export function Catalog() {
  const { openChat } = useUI()
  const [category, setCategory] = useState<CategoryFilter>('todas')
  const [query, setQuery] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [sort, setSort] = useState<SortKey>('relevancia')

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    const list = PRODUCTS.filter((product) => {
      if (category !== 'todas' && product.category !== category) return false
      if (tags.length > 0 && !tags.every((tag) => product.tags.includes(tag))) return false
      if (q && !normalize(`${product.name} ${product.description}`).includes(q)) return false
      return true
    })
    if (sort === 'menor') return [...list].sort((a, b) => minPrice(a) - minPrice(b))
    if (sort === 'maior') return [...list].sort((a, b) => minPrice(b) - minPrice(a))
    if (sort === 'az') return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return list
  }, [category, query, tags, sort])

  const gridRef = useRef<HTMLDivElement>(null)
  useFlip(gridRef, filtered.map((product) => product.id).join('|'))

  const toggleTag = (tag: Tag) =>
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))

  const hasFilters = category !== 'todas' || query !== '' || tags.length > 0 || sort !== 'relevancia'

  const reset = () => {
    setCategory('todas')
    setQuery('')
    setTags([])
    setSort('relevancia')
  }

  const countIn = (id: CategoryFilter) =>
    id === 'todas' ? PRODUCTS.length : PRODUCTS.filter((product) => product.category === id).length

  return (
    <section className="section" id="cardapio" aria-labelledby="cardapio-title">
      <div className="container">
        <div className="section__head" data-reveal>
          <h2 id="cardapio-title">Cardápio</h2>
          <p>Escolha o tamanho, toque em Adicionar e finalize pelo chat. O pedido fica guardado aqui no seu aparelho.</p>
        </div>
      </div>

      <div className="filters">
        <div className="container filters__inner">
          <div className="filters__cats" role="group" aria-label="Categorias">
            {[{ id: 'todas' as CategoryFilter, label: 'Tudo' }, ...CATEGORIES].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tab${category === item.id ? ' is-active' : ''}`}
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id as CategoryFilter)}
              >
                {item.label}
                <span className="tab__count">{countIn(item.id as CategoryFilter)}</span>
              </button>
            ))}
          </div>

          <div className="filters__tools">
            <label className="search">
              <Icon name="search" size={18} />
              <span className="sr-only">Buscar no cardápio</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar sabor ou bebida"
              />
            </label>

            <div className="filters__tags" role="group" aria-label="Filtrar por característica">
              {TAG_FILTERS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`chip-filter${tags.includes(tag) ? ' is-active' : ''}`}
                  aria-pressed={tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {TAG_LABELS[tag]}
                </button>
              ))}
            </div>

            <label className="select">
              <span className="sr-only">Ordenar por</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
                <option value="relevancia">Ordem do cardápio</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="az">Nome, de A a Z</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="container">
        <p className="results" aria-live="polite">
          {filtered.length === 1 ? '1 item' : `${filtered.length} itens`}
          {hasFilters && (
            <button type="button" className="link-btn" onClick={reset}>
              Limpar filtros
            </button>
          )}
        </p>

        {filtered.length > 0 ? (
          <div className="grid" ref={gridRef}>
            {filtered.map((product) => (
              <div className="grid__item" key={product.id} data-flip-id={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>Nenhum item com esses filtros</h3>
            <p>Tente buscar por outro nome ou limpe os filtros para ver o cardápio inteiro.</p>
            <button type="button" className="btn btn--primary" onClick={reset}>
              Limpar filtros
            </button>
          </div>
        )}

        <div className="catalog__cta" data-reveal>
          <p>Não achou o que queria? A Help encontra pra você.</p>
          <button type="button" className="btn btn--dark" onClick={() => openChat()}>
            <Icon name="chat" size={18} />
            Falar com a Help
          </button>
        </div>
      </div>
    </section>
  )
}
