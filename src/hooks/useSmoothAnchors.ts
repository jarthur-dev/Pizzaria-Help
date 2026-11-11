import { useEffect } from 'react'
import { animateValue, easeInOutCubic, gentle } from '../utils/motion'

/** Links como "#cardapio" deslizam até a seção com a mesma curva de movimento do resto da página. */
export function useSmoothAnchors() {
  useEffect(() => {
    const html = document.documentElement
    let cancel: (() => void) | null = null

    const stop = () => {
      cancel?.()
      cancel = null
      html.style.scrollBehavior = ''
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link) return
      const hash = link.getAttribute('href') ?? ''
      if (hash.length < 2) return
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (!target) return

      event.preventDefault()
      stop()

      const offset = (parseFloat(getComputedStyle(html).getPropertyValue('--header-h')) || 68) + 12
      const maxTop = html.scrollHeight - window.innerHeight
      const to = Math.max(0, Math.min(target.getBoundingClientRect().top + window.scrollY - offset, maxTop))
      const from = window.scrollY

      history.pushState(null, '', hash)
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')

      if (Math.abs(to - from) < 2) {
        window.scrollTo(0, to)
        target.focus({ preventScroll: true })
        return
      }

      // O `scroll-behavior: smooth` do CSS atrapalharia a animação quadro a quadro.
      html.style.scrollBehavior = 'auto'
      cancel = animateValue(from, to, {
        duration: gentle(Math.min(1100, 450 + Math.abs(to - from) * 0.25)),
        ease: easeInOutCubic,
        onUpdate: (value) => window.scrollTo(0, value),
        onDone: () => {
          cancel = null
          html.style.scrollBehavior = ''
          target.focus({ preventScroll: true })
        },
      })
    }

    document.addEventListener('click', onClick)
    // Se a pessoa mexer na rolagem durante o deslize, ela assume o controle.
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', stop)

    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
      window.removeEventListener('keydown', stop)
      stop()
    }
  }, [])
}
