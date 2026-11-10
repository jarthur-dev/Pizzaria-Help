import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent } from 'react'
import { PRODUCTS } from '../data/products'
import { animateValue, easeInOutCubic, prefersReducedMotion } from '../utils/motion'
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
  const cancelRef = useRef<(() => void) | null>(null)
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0, lastX: 0, lastT: 0, velocity: 0 })

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

  /** Interrompe um deslize em andamento e devolve o encaixe (snap) ao navegador. */
  const stop = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
    trackRef.current?.classList.remove('is-moving')
  }, [])

  const measure = useCallback(() => {
    const track = trackRef.current
    const size = stepSize()
    if (!track || size === 0) return
    setMaxIndex(Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / size)))
    setIndex(Math.round(track.scrollLeft / size))
  }, [stepSize])

  useEffect(() => {
    stop()
    const track = trackRef.current
    if (track) track.scrollLeft = 0
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [period, measure, stop])

  /**
   * Desliza até a posição `x` com easing. Durante o movimento o `scroll-snap` é desligado
   * (classe is-moving); com ele ligado o navegador "puxava" cada quadro e o carrossel pulava.
   */
  const slideTo = useCallback(
    (x: number) => {
      const track = trackRef.current
      if (!track) return
      stop()
      const max = track.scrollWidth - track.clientWidth
      const target = Math.max(0, Math.min(x, max))
      const from = track.scrollLeft
      if (prefersReducedMotion() || Math.abs(target - from) < 1) {
        track.scrollLeft = target
        return
      }
      track.classList.add('is-moving')
      cancelRef.current = animateValue(from, target, {
        duration: Math.min(900, 480 + Math.abs(target - from) * 0.3),
        ease: easeInOutCubic,
        onUpdate: (value) => {
          track.scrollLeft = value
        },
        onDone: () => {
          cancelRef.current = null
          track.classList.remove('is-moving')
        },
      })
    },
    [stop],
  )

  const goTo = useCallback(
    (target: number) => {
      slideTo(target * stepSize())
    },
    [slideTo, stepSize],
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

  // Arrastar com o mouse. No toque o próprio navegador já cuida, com inércia nativa.
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const track = trackRef.current
    if (!track) return
    stop()
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startLeft: track.scrollLeft,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
    }
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    const track = trackRef.current
    if (!d.active || !track) return
    const dx = event.clientX - d.startX
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true
      track.setPointerCapture(event.pointerId)
      track.classList.add('is-dragging')
    }
    if (!d.moved) return
    const now = performance.now()
    const dt = now - d.lastT
    if (dt > 0) d.velocity = d.velocity * 0.6 + (((d.lastX - event.clientX) / dt) * 0.4)
    d.lastX = event.clientX
    d.lastT = now
    track.scrollLeft = d.startLeft - dx
  }

  const endDrag = () => {
    const d = drag.current
    const track = trackRef.current
    if (!d.active || !track) return
    d.active = false
    if (!d.moved) return
    const size = stepSize()
    // Um arrasto rápido "joga" o carrossel um pouco além; depois ele encaixa no card mais próximo.
    const flick = Math.max(-1.6, Math.min(1.6, d.velocity))
    const projected = track.scrollLeft + flick * 220
    slideTo(Math.round(projected / size) * size)
    track.classList.remove('is-dragging')
  }

  /** Depois de arrastar, o clique que o navegador dispara não deve abrir/adicionar nada. */
  const onClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      event.preventDefault()
      event.stopPropagation()
      drag.current.moved = false
    }
  }

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
        <div className="section__head section__head--row" data-reveal>
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
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(event) => event.preventDefault()}
          onWheel={stop}
          onTouchStart={stop}
        >
          {items.map((product) => (
            <div className="carousel__slide" key={product.id} data-reveal>
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
