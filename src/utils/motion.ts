/** Utilitários de movimento: easings e uma animação numérica baseada em requestAnimationFrame. */

export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

interface AnimateOptions {
  duration: number
  ease?: (t: number) => number
  onUpdate: (value: number) => void
  onDone?: () => void
}

/** Anima de `from` até `to`. Devolve uma função que cancela a animação. */
export function animateValue(from: number, to: number, { duration, ease = easeInOutCubic, onUpdate, onDone }: AnimateOptions) {
  let frame = 0
  let start = 0
  let cancelled = false

  const step = (now: number) => {
    if (cancelled) return
    if (!start) start = now
    const progress = Math.min(1, (now - start) / duration)
    onUpdate(from + (to - from) * ease(progress))
    if (progress < 1) frame = requestAnimationFrame(step)
    else onDone?.()
  }

  frame = requestAnimationFrame(step)

  return () => {
    cancelled = true
    cancelAnimationFrame(frame)
  }
}
