import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { PRODUCTS } from '../data/products'
import { Icon } from './Icon'
import { ProductCard } from './ProductCard'

type Period = 'semana' | 'mes'

const PERIODS: { id: Period; label: string; ribbon: string }[] = [
  { id: 'semana', label: 'Da semana', ribbon: 'Destaque da semana' },
  { id: 'mes', label: 'Do mês', ribbon: 'Destaque do mês' },
]

export function FeaturedCarousel() {
  const [period, setPeriod] = useState<Period>('semana')
  const [index, setIndex] = useState(0)
  const [maxIndex, setMaxIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => PRODUCTS.filter((product) => product.highlight === period), [period])
  const ribbon = PERIODS.find((p) => p.id === period)?.ribbon ?? ''

  /** Largura de um slide + espaçamento. */
  const stepSize = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null | undefined
    if (!track || !first) return 0
    const gap = parseFloat(getComputedStyle(track).columnGap)
    return first.offsetWidth + (Number.isFinite(gap) ? gap : 20)
  }, [])

  const measure = useCallback(() => {
    const track = trackRef.current
    const size = stepSize()
    if (!track || size === 0) return
    setMaxIndex(Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / size)))
    setIndex(Math.round(track.scrollLeft / size))
  }, [stepSize])

  useEffect(() => {
    const track = trackRef.current
    if (track) track.scrollLeft = 0
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [period, measure])

  const goTo = useCallback(
    (target: number) => {
      trackRef.current?.scrollTo({ left: target * stepSize(), behavior: 'smooth' })
    },
    [stepSize],
  )

  const next = useCallback(() => {
    const track = trackRef.current
    const size = stepSize()
    if (!track || size === 0) return
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
    goTo(atEnd ? 0 : Math.round(track.scrollLeft / size) + 1)
  }, [goTo, stepSize])

  const prev = useCallback(() => {
    const track = trackRef.current
    const size = stepSize()
    if (!track || size === 0) return
    const atStart = track.scrollLeft <= 4
    goTo(atStart ? Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / size)) : Math.round(track.scrollLeft / size) - 1)
  }, [goTo, stepSize])

  // Passa sozinho a cada poucos segundos, a menos que a pessoa esteja interagindo
  // ou prefira menos movimento.
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(next, 5500)
    return () => clearInterval(id)
  }, [paused, next])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      next()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      prev()
    }
  }

  return (
    <section
      className="section section--yellow"
      id="destaques"
      aria-labelledby="destaques-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="container">
        <div className="section__head section__head--row">
          <div>
            <h2 id="destaques-title">Destaques</h2>
            <p>Os sabores e combos que mais saem do forno neste período.</p>
          </div>

          <div className="carousel__controls">
            <div className="tabs" role="group" aria-label="Período dos destaques">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`tab${p.id === period ? ' is-active' : ''}`}
                  aria-pressed={p.id === period}
                  onClick={() => setPeriod(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="arrows">
              <button type="button" className="icon-btn icon-btn--solid" onClick={prev} aria-label="Itens anteriores">
                <Icon name="left" />
              </button>
              <button type="button" className="icon-btn icon-btn--solid" onClick={next} aria-label="Próximos itens">
                <Icon name="right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div
          className="carousel__track"
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-roledescription="carrossel"
          aria-label={`Destaques ${period === 'semana' ? 'da semana' : 'do mês'}`}
          onScroll={measure}
          onKeyDown={onKeyDown}
        >
          {items.map((product) => (
            <div className="carousel__slide" key={product.id}>
              <ProductCard product={product} ribbon={ribbon} featured />
            </div>
          ))}
        </div>

        {maxIndex > 0 && (
          <div className="carousel__dots">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`dot${i === index ? ' is-active' : ''}`}
                aria-label={`Ir para a posição ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
