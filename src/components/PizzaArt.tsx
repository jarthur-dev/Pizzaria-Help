import { useId, useMemo } from 'react'
import type { ReactElement } from 'react'
import type { Topping } from '../types'

/**
 * Pizza desenhada em SVG. Os ingredientes são espalhados de forma pseudoaleatória,
 * mas sempre iguais para o mesmo `seed`, então cada sabor tem a sua "cara" fixa.
 */

export type PizzaBase = 'tomato' | 'cheese' | 'chocolate'

interface ToppingSpec {
  count: number
  size: number
  draw: (index: number) => ReactElement
}

const CONFETTI = ['#E8432F', '#FFC933', '#3BA7E0', '#7BC74D', '#F58AC4']

const SPECS: Record<Topping, ToppingSpec> = {
  calabresa: {
    count: 9,
    size: 8.5,
    draw: () => (
      <>
        <circle r="8" fill="#B5382B" />
        <circle r="5.2" fill="#CC5240" />
        <circle cx="-2" cy="-1.5" r="1" fill="#8E2A20" />
        <circle cx="2.2" cy="1.8" r="1" fill="#8E2A20" />
      </>
    ),
  },
  pepperoni: {
    count: 9,
    size: 9,
    draw: () => (
      <>
        <circle r="8.5" fill="#A8261C" stroke="#7E1B14" strokeWidth="1" />
        <circle cx="-2.5" cy="-2" r="1.1" fill="#7E1B14" />
        <circle cx="2.5" cy="2.5" r="1.1" fill="#7E1B14" />
        <circle cx="2.5" cy="-3" r="0.9" fill="#7E1B14" />
      </>
    ),
  },
  mussarela: {
    count: 8,
    size: 7,
    draw: () => <ellipse rx="7" ry="4" fill="#FFF2C2" opacity="0.92" />,
  },
  tomate: {
    count: 6,
    size: 7,
    draw: () => (
      <>
        <circle r="7" fill="#DE3A2B" />
        <circle r="4.4" fill="#EE5A48" />
        <circle cx="-1.5" cy="-1.5" r="1.1" fill="#F7A99E" />
      </>
    ),
  },
  manjericao: {
    count: 6,
    size: 7,
    draw: () => (
      <>
        <ellipse rx="7" ry="3.8" fill="#2F8F3F" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#1F6B2D" strokeWidth="0.8" />
      </>
    ),
  },
  azeitona: {
    count: 7,
    size: 5,
    draw: () => (
      <>
        <circle r="4.5" fill="#2B2B2B" />
        <circle r="1.7" fill="#F5CB55" />
      </>
    ),
  },
  cebola: {
    count: 7,
    size: 6.5,
    draw: () => <circle r="5.5" fill="none" stroke="#EAD3F0" strokeWidth="2" opacity="0.95" />,
  },
  bacon: {
    count: 7,
    size: 8,
    draw: () => (
      <>
        <rect x="-7" y="-2.2" width="14" height="4.4" rx="1.4" fill="#B5533A" />
        <rect x="-7" y="-0.5" width="14" height="1.2" fill="#E8B49B" />
      </>
    ),
  },
  frango: {
    count: 8,
    size: 6,
    draw: () => <ellipse rx="6" ry="3.8" fill="#F0CFA0" stroke="#D9B07A" strokeWidth="0.8" />,
  },
  milho: {
    count: 18,
    size: 3,
    draw: () => <circle r="2.6" fill="#F5C518" />,
  },
  cogumelo: {
    count: 6,
    size: 6.5,
    draw: () => (
      <>
        <circle r="6" fill="#E8DCC8" />
        <path d="M-4 1a4.5 4.5 0 0 1 8 0" fill="none" stroke="#C9B793" strokeWidth="1.2" />
      </>
    ),
  },
  pimentao: {
    count: 7,
    size: 6,
    draw: (i) => <rect x="-6" y="-1.8" width="12" height="3.6" rx="1.8" fill={i % 2 === 0 ? '#3E9B3E' : '#E5A91B'} />,
  },
  presunto: {
    count: 6,
    size: 7,
    draw: () => <rect x="-6" y="-4.5" width="12" height="9" rx="2" fill="#F4A8A0" stroke="#E58A82" strokeWidth="0.8" />,
  },
  catupiry: {
    count: 8,
    size: 5.5,
    draw: () => <circle r="5" fill="#FFFDF2" opacity="0.96" />,
  },
  chocolate: {
    count: 8,
    size: 8,
    draw: () => <ellipse rx="9" ry="6" fill="#3B1E10" opacity="0.9" />,
  },
  morango: {
    count: 8,
    size: 7,
    draw: () => (
      <>
        <circle r="6.5" fill="#D6243F" />
        <circle cx="-2" cy="-1" r="0.8" fill="#FFD9DE" />
        <circle cx="2" cy="1.5" r="0.8" fill="#FFD9DE" />
        <circle cx="1" cy="-2.5" r="0.8" fill="#FFD9DE" />
      </>
    ),
  },
  banana: {
    count: 8,
    size: 7.5,
    draw: () => (
      <>
        <circle r="7" fill="#F6E27F" stroke="#E3C85B" strokeWidth="1" />
        <circle r="2" fill="#E9CF68" />
      </>
    ),
  },
  confete: {
    count: 22,
    size: 3,
    draw: (i) => <circle r="2.6" fill={CONFETTI[i % CONFETTI.length]} />,
  },
  goiabada: {
    count: 7,
    size: 6,
    draw: () => <rect x="-4.5" y="-4.5" width="9" height="9" rx="2" fill="#A3262A" opacity="0.92" />,
  },
}

const SAUCE: Record<PizzaBase, string> = {
  tomato: '#C9301F',
  cheese: '#F3C94E',
  chocolate: '#5B2E18',
}

const BUBBLES: [number, number, number][] = [
  [70, 60, 7],
  [128, 72, 9],
  [92, 120, 8],
  [138, 128, 6],
  [58, 104, 5],
  [112, 88, 5],
]

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Piece {
  kind: Topping
  x: number
  y: number
  rot: number
  index: number
}

function layout(toppings: Topping[], seed: string): Piece[] {
  const rand = mulberry32(hash(seed))
  const placed: { x: number; y: number; r: number }[] = []
  const pieces: Piece[] = []
  // Peças maiores primeiro, para as pequenas preencherem os espaços.
  const kinds = [...toppings].sort((a, b) => SPECS[b].size - SPECS[a].size)

  for (const kind of kinds) {
    const spec = SPECS[kind]
    for (let index = 0; index < spec.count; index++) {
      let x = 100
      let y = 100
      for (let attempt = 0; attempt < 40; attempt++) {
        const angle = rand() * Math.PI * 2
        const radius = Math.sqrt(rand()) * (74 - spec.size)
        x = 100 + Math.cos(angle) * radius
        y = 100 + Math.sin(angle) * radius
        const clash = placed.some((p) => Math.hypot(p.x - x, p.y - y) < (p.r + spec.size) * 0.85)
        if (!clash) break
      }
      placed.push({ x, y, r: spec.size })
      pieces.push({ kind, x, y, rot: rand() * 360, index })
    }
  }
  return pieces
}

interface PizzaArtProps {
  toppings: Topping[]
  seed: string
  base?: PizzaBase
  className?: string
}

export function PizzaArt({ toppings, seed, base = 'tomato', className }: PizzaArtProps) {
  const uid = useId().replace(/:/g, '')
  const pieces = useMemo(() => layout(toppings, seed), [toppings, seed])

  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${uid}-crust`} cx="50%" cy="45%" r="60%">
          <stop offset="70%" stopColor="#F4B95F" />
          <stop offset="100%" stopColor="#D48A2B" />
        </radialGradient>
        <radialGradient id={`${uid}-cheese`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FFE58F" />
          <stop offset="100%" stopColor="#F5CB55" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="94" fill={`url(#${uid}-crust)`} />
      <circle cx="100" cy="100" r="94" fill="none" stroke="#B87420" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="80" fill={SAUCE[base]} />

      {base === 'tomato' && (
        <>
          <circle cx="100" cy="100" r="77" fill={`url(#${uid}-cheese)`} />
          {BUBBLES.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#FFF2B8" opacity="0.55" />
          ))}
        </>
      )}
      {base === 'cheese' && <circle cx="100" cy="100" r="80" fill={`url(#${uid}-cheese)`} />}
      {base === 'chocolate' && <ellipse cx="82" cy="78" rx="34" ry="22" fill="#7A4326" opacity="0.45" />}

      {pieces.map((piece, i) => (
        <g key={i} transform={`translate(${piece.x.toFixed(1)} ${piece.y.toFixed(1)}) rotate(${piece.rot.toFixed(0)})`}>
          {SPECS[piece.kind].draw(piece.index)}
        </g>
      ))}

      {[0, 1, 2, 3].map((k) => {
        const angle = (k * Math.PI) / 4
        const dx = Math.cos(angle) * 94
        const dy = Math.sin(angle) * 94
        return (
          <line
            key={k}
            x1={100 - dx}
            y1={100 - dy}
            x2={100 + dx}
            y2={100 + dy}
            stroke="rgba(60,20,5,0.14)"
            strokeWidth="1.2"
          />
        )
      })}
    </svg>
  )
}
