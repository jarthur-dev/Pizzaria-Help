import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { EASE_OUT, prefersReducedMotion } from '../utils/motion'

interface Box {
  x: number
  y: number
}

/**
 * Técnica FLIP: quando a lista de filhos muda (filtro, busca, ordenação), os itens que continuam
 * deslizam até o novo lugar e os novos entram com fade, em vez de "teleportar".
 * Cada filho precisa de `data-flip-id`. `key` deve mudar sempre que a lista mudar.
 */
export function useFlip(container: RefObject<HTMLElement | null>, key: string) {
  const previous = useRef<Map<string, Box>>(new Map())
  const width = useRef(0)

  useLayoutEffect(() => {
    const el = container.current
    if (!el) {
      previous.current = new Map()
      return
    }

    const next = new Map<string, Box>()
    const children = Array.from(el.children) as HTMLElement[]
    children.forEach((child) => {
      const id = child.dataset.flipId
      if (id) next.set(id, { x: child.offsetLeft, y: child.offsetTop })
    })

    const first = previous.current.size === 0
    const resized = width.current !== 0 && width.current !== window.innerWidth
    width.current = window.innerWidth

    if (!first && !resized && !prefersReducedMotion()) {
      let entering = 0
      children.forEach((child) => {
        const id = child.dataset.flipId
        if (!id) return
        const before = previous.current.get(id)
        const after = next.get(id)!
        if (before) {
          const dx = before.x - after.x
          const dy = before.y - after.y
          if (dx || dy) {
            child.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }], {
              duration: 520,
              easing: EASE_OUT,
            })
          }
        } else {
          child.animate(
            [
              { opacity: 0, transform: 'translateY(18px) scale(0.97)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: 520, delay: Math.min(entering++, 8) * 40, easing: EASE_OUT, fill: 'backwards' },
          )
        }
      })
    }

    previous.current = next
  }, [container, key])
}
