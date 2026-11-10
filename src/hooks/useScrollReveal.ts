import { useEffect } from 'react'
import { prefersReducedMotion } from '../utils/motion'

/**
 * Faz os elementos com `data-reveal` surgirem suavemente quando entram na tela.
 * Elementos que aparecem depois (ex.: troca de aba no carrossel) são observados automaticamente.
 * Sem JavaScript ou com "reduzir movimento", tudo fica visível desde o início.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return

    const root = document.documentElement
    root.classList.add('reveal-ready')

    const finish = (el: HTMLElement) => {
      el.removeAttribute('data-reveal')
      el.classList.remove('is-visible')
      el.style.transitionDelay = ''
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, i) => {
            const el = entry.target as HTMLElement
            io.unobserve(el)
            // Quem entra junto aparece em cascata.
            el.style.transitionDelay = `${Math.min(i, 6) * 80}ms`
            el.classList.add('is-visible')
            const timer = window.setTimeout(() => finish(el), 1400)
            el.addEventListener(
              'transitionend',
              (event) => {
                if (event.target === el && event.propertyName === 'opacity') {
                  window.clearTimeout(timer)
                  finish(el)
                }
              },
              { once: true },
            )
          })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    const watch = (el: Element) => io.observe(el)
    document.querySelectorAll('[data-reveal]').forEach(watch)

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          if (node.hasAttribute('data-reveal')) watch(node)
          node.querySelectorAll('[data-reveal]').forEach(watch)
        })
      }
    })
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mutations.disconnect()
      root.classList.remove('reveal-ready')
    }
  }, [])
}
