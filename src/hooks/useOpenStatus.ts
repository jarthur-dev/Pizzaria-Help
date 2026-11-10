import { useEffect, useState } from 'react'
import { isOpenNow } from '../utils/time'

/** `true` quando a pizzaria está aberta. Reavalia a cada minuto. */
export function useOpenStatus(): boolean {
  const [open, setOpen] = useState<boolean>(() => isOpenNow())

  useEffect(() => {
    const id = setInterval(() => setOpen(isOpenNow()), 60000)
    return () => clearInterval(id)
  }, [])

  return open
}
